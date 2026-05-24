<?php

namespace App\Http\Controllers;

use App\Ai\Agents\RentalAssistant;
use App\Events\AiChatRequested;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AiAgentController extends Controller
{
    /**
     * Stream the AI response token-by-token via Server-Sent Events.
     *
     * Events sent over the SSE stream:
     *   { type: "step",  step: string }           — reasoning step progress
     *   { type: "start" }                          — answer is about to begin
     *   { type: "chunk", text: string }            — one word/token of the answer
     *   { type: "done",  suggestions: string[] }   — stream complete + follow-up chips
     *   { type: "error", message: string }         — something went wrong
     */
    public function stream(Request $request): StreamedResponse
    {
        $request->validate([
            'message' => ['required', 'string'],
            'history' => ['nullable', 'array'],
            'history.*.role' => ['required', 'string', 'in:user,assistant,system'],
            'history.*.content' => ['required', 'string'],
        ]);

        $message = $request->input('message');
        $history = $request->input('history', []);

        $agent = new RentalAssistant;
        $agent->setHistory($history);

        return response()->stream(function () use ($agent, $message) {
            $send = function (array $data): void {
                echo 'data: '.json_encode($data)."\n\n";
                ob_flush();
                flush();
            };

            try {
                $send(['type' => 'step', 'step' => 'Menganalisis pertanyaan Anda...']);
                usleep(500_000);

                $send(['type' => 'step', 'step' => 'Memindai data operasional...']);
                usleep(500_000);

                $send(['type' => 'step', 'step' => 'Asisten sedang memikirkan respons...']);

                // Call AI — blocking until full response is ready
                $raw = $agent->prompt($message)->text;

                $send(['type' => 'step', 'step' => 'Merumuskan jawaban terbaik...']);
                usleep(300_000);

                // Parse Markdown answer + suggestions
                $parsed = $this->parseAgentResponse($raw);

                // Signal that the answer bubble should open
                $send(['type' => 'start']);

                // Stream the answer word-by-word (≈ 50 tokens/sec)
                $tokens = preg_split('/(\s+)/u', $parsed['answer'], -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY) ?: [];
                foreach ($tokens as $token) {
                    $send(['type' => 'chunk', 'text' => $token]);
                    usleep(18_000); // 18 ms ≈ 55 tokens/sec
                }

                // Stream complete — send suggestions
                $send(['type' => 'done', 'suggestions' => $parsed['suggestions']]);

            } catch (Exception $e) {
                Log::error('AI Stream Error: '.$e->getMessage());
                $send(['type' => 'error', 'message' => 'Koneksi ke asisten AI terputus. Pastikan Ollama dengan model qwen2.5:3b sudah berjalan.']);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-store',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    /**
     * Legacy JSON endpoint — kept for existing tests and backward compatibility.
     * Use /ai/stream for the real-time streaming experience.
     */
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message' => ['required', 'string'],
            'history' => ['nullable', 'array'],
            'history.*.role' => ['required', 'string', 'in:user,assistant,system'],
            'history.*.content' => ['required', 'string'],
            'requestId' => ['nullable', 'string', 'max:64'],
        ]);

        $message = $request->input('message');
        $history = $request->input('history', []);
        $requestId = $request->input('requestId', (string) str()->uuid());

        try {
            AiChatRequested::dispatch($request->user()->id, $message, $history, $requestId);

            return response()->json(['status' => 'dispatched']);
        } catch (Exception $e) {
            Log::error('AI Agent Error: '.$e->getMessage());

            return response()->json([
                'response' => 'Maaf, asisten AI sedang tidak dapat dihubungi.',
            ], 500);
        }
    }

    /**
     * Parse the agent's Markdown response into answer + suggestions.
     *
     * Expected format:
     *   <markdown answer>
     *   ---SARAN---
     *   - suggestion 1
     *
     * @return array{answer: string, suggestions: string[]}
     */
    private function parseAgentResponse(string $raw): array
    {
        $separator = '---SARAN---';

        if (str_contains($raw, $separator)) {
            [$answerPart, $suggestionsPart] = explode($separator, $raw, 2);

            $suggestions = [];
            foreach (explode("\n", $suggestionsPart) as $line) {
                $line = trim($line);
                $line = preg_replace('/^[-*]\s+/', '', $line) ?? $line;
                $line = preg_replace('/^\d+\.\s+/', '', $line) ?? $line;
                $line = trim($line);
                if ($line !== '') {
                    $suggestions[] = $line;
                }
            }

            return [
                'answer' => trim($answerPart),
                'suggestions' => array_slice($suggestions, 0, 3),
            ];
        }

        return [
            'answer' => trim($raw),
            'suggestions' => [],
        ];
    }
}
