<?php

namespace App\Listeners;

use App\Ai\Agents\RentalAssistant;
use App\Events\AiChatRequested;
use App\Events\AiReasoningUpdated;
use Exception;
use Illuminate\Support\Facades\Log;

class ProcessAiChat
{
    /**
     * Handle the event.
     */
    public function handle(AiChatRequested $event): void
    {
        $userId = $event->userId;
        $requestId = $event->requestId;

        try {
            // Step 1: Analyzing query
            AiReasoningUpdated::dispatch($userId, 'Menganalisis pertanyaan Anda...', 'thinking', null, [], $requestId);
            usleep(600000); // 600ms

            // Step 2: Accessing knowledge/categories
            AiReasoningUpdated::dispatch($userId, 'Memindai data operasional...', 'thinking', null, [], $requestId);
            usleep(600000); // 600ms

            // Initialize agent and prompt
            $agent = new RentalAssistant;
            $agent->setHistory($event->history);

            // Step 3: Invoking AI
            AiReasoningUpdated::dispatch($userId, 'Asisten sedang memikirkan respons...', 'thinking', null, [], $requestId);

            $raw = $agent->prompt($event->message)->text;

            // Step 4: Finalizing response
            AiReasoningUpdated::dispatch($userId, 'Merumuskan jawaban terbaik...', 'thinking', null, [], $requestId);
            usleep(400000); // 400ms

            // Parse the structured JSON response from the agent
            $parsed = $this->parseAgentResponse($raw);

            // Broadcast the completed response with suggestions
            AiReasoningUpdated::dispatch(
                $userId,
                'Selesai',
                'completed',
                $parsed['answer'],
                $parsed['suggestions'],
                $requestId
            );

        } catch (Exception $e) {
            Log::error('AI Agent Event Processing Error: '.$e->getMessage());

            AiReasoningUpdated::dispatch(
                $userId,
                'Terjadi kesalahan koneksi',
                'error',
                'Maaf, asisten AI sedang tidak dapat dihubungi. Pastikan Ollama dengan model qwen2.5:3b sudah berjalan.',
                [],
                $requestId
            );
        }
    }

    /**
     * Parse the agent's Markdown response into answer + suggestions.
     *
     * Expected format:
     *   <markdown answer>
     *   ---SARAN---
     *   - suggestion 1
     *   - suggestion 2
     *   - suggestion 3
     *
     * @return array{answer: string, suggestions: string[]}
     */
    private function parseAgentResponse(string $raw): array
    {
        $separator = '---SARAN---';

        if (str_contains($raw, $separator)) {
            [$answerPart, $suggestionsPart] = explode($separator, $raw, 2);

            // Parse bullet-point suggestions
            $suggestions = [];
            foreach (explode("\n", $suggestionsPart) as $line) {
                $line = trim($line);
                // Strip leading "- " or "* " or "1. " markers
                $line = preg_replace('/^[-*]\s+/', '', $line);
                $line = preg_replace('/^\d+\.\s+/', '', $line ?? '');
                $line = trim($line ?? '');
                if ($line !== '') {
                    $suggestions[] = $line;
                }
            }

            return [
                'answer' => trim($answerPart),
                'suggestions' => array_slice($suggestions, 0, 3),
            ];
        }

        // Fallback: no separator found — return the raw markdown as-is
        return [
            'answer' => trim($raw),
            'suggestions' => [],
        ];
    }
}
