<?php

namespace App\Http\Controllers;

use App\Ai\Agents\RentalAssistant;
use App\Events\AiChatRequested;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Models\Conversation;
use Laravel\Ai\Streaming\Events\TextDelta;
use Laravel\Ai\Streaming\Events\ToolCall;
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
        // Increase execution time limit for local AI tool-calling loops
        set_time_limit(120);

        $request->validate([
            'message' => ['required', 'string'],
            'conversation_id' => ['nullable', 'string'],
        ]);

        $message = $request->input('message');
        $conversationId = $request->input('conversation_id');

        $agent = new RentalAssistant;
        if ($conversationId) {
            $agent->continue($conversationId, as: $request->user());
        } else {
            $agent->forUser($request->user());
        }

        return response()->stream(function () use ($agent, $message) {
            $send = function (array $data): void {
                echo 'data: '.json_encode($data)."\n\n";
                ob_flush();
                flush();
            };

            try {
                $send(['type' => 'step', 'step' => 'Menganalisis pertanyaan Anda...']);

                $stream = $agent->stream($message);
                $streamer = new AiResponseStreamer($send, fn (string $text) => $this->cleanAgentResponseText($text));
                $started = false;

                foreach ($stream as $event) {
                    if ($event instanceof TextDelta) {
                        if (! $started) {
                            $send(['type' => 'start']);
                            $started = true;
                        }
                        $streamer->handleToken($event->delta);
                    } elseif ($event instanceof ToolCall) {
                        $toolName = $event->toolCall->name;
                        $friendlyName = match (class_basename($toolName)) {
                            'GetProductsTool' => 'Memindai katalog produk dan stok...',
                            'GetCustomersTool' => 'Membaca profil data pelanggan...',
                            'GetRentalsTool' => 'Mengecek riwayat transaksi sewa...',
                            'GetRentalSummaryTool' => 'Menghitung ringkasan persewaan...',
                            default => 'Menjalankan internal tool: '.class_basename($toolName).'...',
                        };
                        $send(['type' => 'step', 'step' => $friendlyName]);
                    }
                }

                $parsed = $streamer->finalize();
                $send([
                    'type' => 'done',
                    'suggestions' => $parsed['suggestions'],
                    'text' => $parsed['answer'],
                    'conversation_id' => $agent->currentConversation(),
                ]);

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
        $answer = $raw;
        $suggestions = [];

        if (str_contains($raw, $separator)) {
            [$answerPart, $suggestionsPart] = explode($separator, $raw, 2);
            $answer = $answerPart;

            foreach (explode("\n", $suggestionsPart) as $line) {
                $line = trim($line);
                $line = preg_replace('/^[-*]\s+/', '', $line) ?? $line;
                $line = preg_replace('/^\d+\.\s+/', '', $line) ?? $line;
                $line = trim($line);
                if ($line !== '') {
                    $suggestions[] = $line;
                }
            }
            $suggestions = array_slice($suggestions, 0, 3);
        }

        // Contextual Fallbacks if the model failed to generate suggestions
        if (empty($suggestions)) {
            $lowerText = strtolower($raw);
            if (str_contains($lowerText, 'sewa') || str_contains($lowerText, 'transaksi') || str_contains($lowerText, 'rental')) {
                $suggestions = [
                    'Bagaimana cara memproses pengembalian barang?',
                    'Bagaimana cara mengubah tanggal sewa?',
                    'Bagaimana cara mencetak bukti transaksi sewa?',
                ];
            } elseif (str_contains($lowerText, 'produk') || str_contains($lowerText, 'stok') || str_contains($lowerText, 'barang')) {
                $suggestions = [
                    'Bagaimana cara mengecek stok produk yang hampir habis?',
                    'Bagaimana cara memperbarui data produk?',
                    'Bagaimana melihat produk terlaris hari ini?',
                ];
            } elseif (str_contains($lowerText, 'pelanggan') || str_contains($lowerText, 'customer') || str_contains($lowerText, 'nik')) {
                $suggestions = [
                    'Bagaimana cara membuat data pelanggan baru?',
                    'Bagaimana cara mencari nomor telepon pelanggan?',
                    'Apakah NIK pelanggan harus unik?',
                ];
            } elseif (str_contains($lowerText, 'laporan') || str_contains($lowerText, 'pendapatan') || str_contains($lowerText, 'analitik') || str_contains($lowerText, 'chart')) {
                $suggestions = [
                    'Bagaimana cara melihat laporan pendapatan hari ini?',
                    'Bagaimana cara mengekspor laporan keuangan?',
                    'Bagaimana membandingkan transaksi Cash vs QRIS?',
                ];
            } else {
                $suggestions = [
                    'Bagaimana cara membuat transaksi sewa baru?',
                    'Bagaimana cara melihat laporan pendapatan hari ini?',
                    'Bagaimana cara mengecek stok produk yang hampir habis?',
                ];
            }
        }

        return [
            'answer' => $this->cleanAgentResponseText($answer),
            'suggestions' => $suggestions,
        ];
    }

    /**
     * Clean up any raw XML-like tool formatting leaks (e.g. <function-name>...</function-name>)
     * that smaller models might output in text responses.
     */
    private function cleanAgentResponseText(string $text): string
    {
        // Replace <function-name>ToolName</function-name> with `ToolName`
        $text = preg_replace('/<function-name>([\w\-]+)<\/function-name>/i', '`$1`', $text);
        // Replace <function-args>...</function-args> with formatted arguments representation
        $text = preg_replace('/<function-args>([\s\S]*?)<\/function-args>/i', ' ($1) ', $text);
        // Remove raw formatting wrapper tags like <call>, </call>, <function-call>, </function-call>
        $text = str_ireplace(['<call>', '</call>', '<function-call>', '</function-call>'], '', $text);
        // Replace raw function:ToolName with `ToolName`
        $text = preg_replace('/\bfunction:([\w\-]+)/i', '`$1`', $text);

        return trim($text);
    }

    /**
     * Get all conversations for the authenticated user.
     */
    public function sessions(Request $request): JsonResponse
    {
        $conversations = Conversation::where('user_id', $request->user()->id)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Conversation $c) => [
                'id' => $c->id,
                'title' => $c->title,
                'createdAt' => $c->updated_at->format('d/m/Y'),
            ]);

        return response()->json($conversations);
    }

    /**
     * Get all messages in a specific conversation for the authenticated user.
     */
    public function messages(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::where('user_id', $request->user()->id)->findOrFail($id);

        $messages = $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                if ($msg->role === 'assistant') {
                    $parsed = $this->parseAgentResponse($msg->content);

                    return [
                        'role' => 'assistant',
                        'content' => $parsed['answer'],
                        'suggestions' => $parsed['suggestions'],
                    ];
                }

                return [
                    'role' => 'user',
                    'content' => $msg->content,
                ];
            });

        return response()->json($messages);
    }

    /**
     * Delete a conversation.
     */
    public function deleteSession(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::where('user_id', $request->user()->id)->findOrFail($id);
        $conversation->messages()->delete();
        $conversation->delete();

        return response()->json(['status' => 'success']);
    }
}

class StreamCleaner
{
    private string $buffer = '';

    private bool $inTag = false;

    public function process(string $token): string
    {
        $output = '';
        $this->buffer .= $token;

        while ($this->buffer !== '') {
            if (! $this->inTag) {
                // Find first occurrence of '<'
                $pos = strpos($this->buffer, '<');
                if ($pos === false) {
                    // No '<' in buffer, we can emit all of it
                    $output .= $this->buffer;
                    $this->buffer = '';
                } else {
                    // Emit everything before '<'
                    $output .= substr($this->buffer, 0, $pos);
                    $this->buffer = substr($this->buffer, $pos);
                    $this->inTag = true;
                }
            } else {
                // We are inside a tag. Find matching '>'
                $pos = strpos($this->buffer, '>');
                if ($pos === false) {
                    // We haven't found '>' yet. Keep buffering.
                    // To prevent infinite buffering if it's not a real tag, check buffer length
                    if (strlen($this->buffer) > 100) {
                        // Flush the first character '<' and reset inTag to re-evaluate
                        $output .= '<';
                        $this->buffer = substr($this->buffer, 1);
                        $this->inTag = false;
                    } else {
                        break; // Wait for more tokens
                    }
                } else {
                    // Tag is complete!
                    $tag = substr($this->buffer, 0, $pos + 1);
                    $this->buffer = substr($this->buffer, $pos + 1);
                    $this->inTag = false;

                    // Clean/replace the tag
                    $cleanedTag = $this->cleanTag($tag);
                    $output .= $cleanedTag;
                }
            }
        }

        return $output;
    }

    private function cleanTag(string $tag): string
    {
        $lowerTag = strtolower($tag);
        if ($lowerTag === '<function-name>' || $lowerTag === '</function-name>') {
            return '`';
        }
        if ($lowerTag === '<function-args>') {
            return ' (';
        }
        if ($lowerTag === '</function-args>') {
            return ') ';
        }
        if (in_array($lowerTag, ['<call>', '</call>', '<function-call>', '</function-call>'])) {
            return '';
        }

        return $tag; // Keep other tags
    }

    public function flush(): string
    {
        $output = '';
        if ($this->buffer !== '') {
            $output = $this->buffer;
            $this->buffer = '';
        }
        $this->inTag = false;

        return $output;
    }
}

class AiResponseStreamer
{
    private string $accumulatedRaw = '';

    private string $emittedAnswer = '';

    private bool $hasReachedSeparator = false;

    private int $processedRawLength = 0;

    private StreamCleaner $cleaner;

    private \Closure $send;

    private \Closure $cleanCallback;

    public function __construct(\Closure $send, \Closure $cleanCallback)
    {
        $this->send = $send;
        $this->cleanCallback = $cleanCallback;
        $this->cleaner = new StreamCleaner;
    }

    public function handleToken(string $token): void
    {
        if ($this->hasReachedSeparator) {
            $this->accumulatedRaw .= $token;

            return;
        }

        $this->accumulatedRaw .= $token;
        $separator = '---SARAN---';
        $separatorPos = strpos($this->accumulatedRaw, $separator);

        if ($separatorPos !== false) {
            $this->hasReachedSeparator = true;
            // Get the complete raw answer before the separator
            $rawAnswer = substr($this->accumulatedRaw, 0, $separatorPos);

            // Clean the raw answer
            $cleanAnswer = call_user_func($this->cleanCallback, $rawAnswer);

            // Calculate the diff between $cleanAnswer and what we already emitted
            $diff = substr($cleanAnswer, strlen($this->emittedAnswer));
            if ($diff !== '') {
                ($this->send)(['type' => 'chunk', 'text' => $diff]);
                $this->emittedAnswer = $cleanAnswer;
            }
        } else {
            // Check if suffix matches a prefix of the separator
            $suffixLenToHold = 0;
            for ($i = strlen($separator); $i >= 1; $i--) {
                $prefix = substr($separator, 0, $i);
                if (str_ends_with($this->accumulatedRaw, $prefix)) {
                    $suffixLenToHold = $i;
                    break;
                }
            }

            // We can process and emit everything except the held suffix
            $rawToProcessLen = strlen($this->accumulatedRaw) - $suffixLenToHold;

            if ($rawToProcessLen > $this->processedRawLength) {
                $newRaw = substr($this->accumulatedRaw, $this->processedRawLength, $rawToProcessLen - $this->processedRawLength);
                $this->processedRawLength += strlen($newRaw);

                // Clean it using StreamCleaner
                $cleanProcessed = $this->cleaner->process($newRaw);

                if ($cleanProcessed !== '') {
                    ($this->send)(['type' => 'chunk', 'text' => $cleanProcessed]);
                    $this->emittedAnswer .= $cleanProcessed;
                }
            }
        }
    }

    public function finalize(): array
    {
        // Process any remaining held characters
        $rawLen = strlen($this->accumulatedRaw);
        if ($rawLen > $this->processedRawLength) {
            $remainingRaw = substr($this->accumulatedRaw, $this->processedRawLength);
            $this->processedRawLength = $rawLen;

            $cleanProcessed = $this->cleaner->process($remainingRaw);
            if ($cleanProcessed !== '') {
                ($this->send)(['type' => 'chunk', 'text' => $cleanProcessed]);
                $this->emittedAnswer .= $cleanProcessed;
            }
        }

        // Flush cleaner
        $flushed = $this->cleaner->flush();
        if ($flushed !== '') {
            $flushedCleaned = call_user_func($this->cleanCallback, $flushed);
            if ($flushedCleaned !== '') {
                ($this->send)(['type' => 'chunk', 'text' => $flushedCleaned]);
                $this->emittedAnswer .= $flushedCleaned;
            }
        }

        // Now parse the final accumulated raw text
        return $this->parseAgentResponse($this->accumulatedRaw);
    }

    private function parseAgentResponse(string $raw): array
    {
        $separator = '---SARAN---';
        $answer = $raw;
        $suggestions = [];

        if (str_contains($raw, $separator)) {
            [$answerPart, $suggestionsPart] = explode($separator, $raw, 2);
            $answer = $answerPart;

            foreach (explode("\n", $suggestionsPart) as $line) {
                $line = trim($line);
                $line = preg_replace('/^[-*]\s+/', '', $line) ?? $line;
                $line = preg_replace('/^\d+\.\s+/', '', $line) ?? $line;
                $line = trim($line);
                if ($line !== '') {
                    $suggestions[] = $line;
                }
            }
            $suggestions = array_slice($suggestions, 0, 3);
        }

        // Contextual Fallbacks if the model failed to generate suggestions
        if (empty($suggestions)) {
            $lowerText = strtolower($raw);
            if (str_contains($lowerText, 'sewa') || str_contains($lowerText, 'transaksi') || str_contains($lowerText, 'rental')) {
                $suggestions = [
                    'Bagaimana cara memproses pengembalian barang?',
                    'Bagaimana cara mengubah tanggal sewa?',
                    'Bagaimana cara mencetak bukti transaksi sewa?',
                ];
            } elseif (str_contains($lowerText, 'produk') || str_contains($lowerText, 'stok') || str_contains($lowerText, 'barang')) {
                $suggestions = [
                    'Bagaimana cara mengecek stok produk yang hampir habis?',
                    'Bagaimana cara memperbarui data produk?',
                    'Bagaimana melihat produk terlaris hari ini?',
                ];
            } elseif (str_contains($lowerText, 'pelanggan') || str_contains($lowerText, 'customer') || str_contains($lowerText, 'nik')) {
                $suggestions = [
                    'Bagaimana cara membuat data pelanggan baru?',
                    'Bagaimana cara mencari nomor telepon pelanggan?',
                    'Apakah NIK pelanggan harus unik?',
                ];
            } elseif (str_contains($lowerText, 'laporan') || str_contains($lowerText, 'pendapatan') || str_contains($lowerText, 'analitik') || str_contains($lowerText, 'chart')) {
                $suggestions = [
                    'Bagaimana cara melihat laporan pendapatan hari ini?',
                    'Bagaimana cara mengekspor laporan keuangan?',
                    'Bagaimana membandingkan transaksi Cash vs QRIS?',
                ];
            } else {
                $suggestions = [
                    'Bagaimana cara membuat transaksi sewa baru?',
                    'Bagaimana cara melihat laporan pendapatan hari ini?',
                    'Bagaimana cara mengecek stok produk yang hampir habis?',
                ];
            }
        }

        return [
            'answer' => call_user_func($this->cleanCallback, $answer),
            'suggestions' => $suggestions,
        ];
    }
}
