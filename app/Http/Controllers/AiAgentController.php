<?php

namespace App\Http\Controllers;

use App\Events\AiChatRequested;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AiAgentController extends Controller
{
    /**
     * Send a prompt to the AI agent and return the response.
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
            // Dispatch the chat request event (processed synchronously by the listener)
            AiChatRequested::dispatch($request->user()->id, $message, $history, $requestId);

            return response()->json([
                'status' => 'dispatched',
            ]);
        } catch (Exception $e) {
            Log::error('AI Agent Error: '.$e->getMessage());

            return response()->json([
                'response' => 'Maaf, asisten AI sedang tidak dapat dihubungi. Pastikan Ollama dengan model qwen2.5:3b sudah berjalan.',
            ], 500);
        }
    }
}
