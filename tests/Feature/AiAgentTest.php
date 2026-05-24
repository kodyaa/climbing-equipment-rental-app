<?php

namespace Tests\Feature;

use App\Ai\Agents\RentalAssistant;
use App\Events\AiChatRequested;
use App\Events\AiReasoningUpdated;
use App\Listeners\ProcessAiChat;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class AiAgentTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guests cannot access the AI agent chat endpoint.
     */
    public function test_guests_cannot_access_ai_chat(): void
    {
        $response = $this->postJson('/ai/chat', [
            'message' => 'Halo',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test that authenticated users can access the AI agent chat endpoint which dispatches the event.
     */
    public function test_authenticated_users_can_access_ai_chat_by_dispatching_event(): void
    {
        Event::fake([AiChatRequested::class]);

        $user = $this->createOwner();

        $response = $this->actingAs($user)->postJson('/ai/chat', [
            'message' => 'Halo',
            'history' => [],
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'status' => 'dispatched',
        ]);

        Event::assertDispatched(AiChatRequested::class, function ($event) use ($user) {
            return $event->userId === $user->id && $event->message === 'Halo';
        });
    }

    /**
     * Test that the listener processes the chat prompt, prompts the assistant, and broadcasts reasoning steps.
     */
    public function test_listener_processes_chat_and_broadcasts_reasoning_steps(): void
    {
        Event::fake([AiReasoningUpdated::class]);

        // The agent now returns a Markdown response with ---SARAN--- separator
        $fakeMarkdown = implode("\n", [
            'Halo, saya adalah asisten AI.',
            '---SARAN---',
            '- Pertanyaan 1',
            '- Pertanyaan 2',
            '- Pertanyaan 3',
        ]);
        RentalAssistant::fake([$fakeMarkdown]);

        $user = $this->createOwner();
        $event = new AiChatRequested($user->id, 'Halo', []);

        $listener = new ProcessAiChat;
        $listener->handle($event);

        // Verify thinking updates are broadcasted
        Event::assertDispatched(AiReasoningUpdated::class, function ($e) use ($user) {
            return $e->userId === $user->id
                && $e->step === 'Menganalisis pertanyaan Anda...'
                && $e->status === 'thinking';
        });

        Event::assertDispatched(AiReasoningUpdated::class, function ($e) use ($user) {
            return $e->userId === $user->id
                && $e->step === 'Memindai data operasional...'
                && $e->status === 'thinking';
        });

        // Verify final completed response is broadcasted with parsed Markdown answer and suggestions
        Event::assertDispatched(AiReasoningUpdated::class, function ($e) use ($user) {
            return $e->userId === $user->id
                && $e->step === 'Selesai'
                && $e->status === 'completed'
                && $e->response === 'Halo, saya adalah asisten AI.'
                && $e->suggestions === ['Pertanyaan 1', 'Pertanyaan 2', 'Pertanyaan 3'];
        });

        RentalAssistant::assertPrompted('Halo');
    }

    /**
     * Test validation rules for the AI chat endpoint.
     */
    public function test_validation_rules_for_ai_chat(): void
    {
        $user = $this->createOwner();

        // 1. Missing message
        $response = $this->actingAs($user)->postJson('/ai/chat', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['message']);

        // 2. Invalid history structure
        $response = $this->actingAs($user)->postJson('/ai/chat', [
            'message' => 'Halo',
            'history' => [
                ['role' => 'invalid_role', 'content' => 'Test'],
            ],
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['history.0.role']);
    }
}
