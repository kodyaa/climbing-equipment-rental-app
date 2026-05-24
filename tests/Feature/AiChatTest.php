<?php

namespace Tests\Feature;

use App\Ai\Agents\RentalAssistant;
use App\Http\Controllers\AiAgentController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use ReflectionMethod;
use Tests\TestCase;

class AiChatTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guests cannot access the AI stream.
     */
    public function test_guests_cannot_access_ai_stream(): void
    {
        $response = $this->postJson('/ai/stream', [
            'message' => 'Halo',
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test that authenticated users can stream the AI agent response.
     */
    public function test_authenticated_users_can_stream_ai_response(): void
    {
        $fakeMarkdown = implode("\n", [
            'Halo, ini respon <function-name>GetProductsTool</function-name> dari asisten AI.',
            '---SARAN---',
            '- Pertanyaan 1',
            '- Pertanyaan 2',
            '- Pertanyaan 3',
        ]);

        RentalAssistant::fake([$fakeMarkdown]);

        $user = $this->createOwner();

        ob_start(); // Outer buffer
        ob_start(); // Inner buffer
        $response = $this->actingAs($user)->post('/ai/stream', [
            'message' => 'Halo',
            'conversation_id' => null,
        ]);
        $response->sendContent();
        ob_end_clean(); // Clean/close inner buffer
        $content = ob_get_clean(); // Capture outer buffer

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/event-stream; charset=UTF-8');

        // Parse SSE lines
        $lines = explode("\n\n", trim($content));

        $events = [];
        foreach ($lines as $line) {
            if (str_starts_with($line, 'data: ')) {
                $events[] = json_decode(substr($line, 6), true);
            }
        }

        // Assert starting event
        $this->assertEquals(['type' => 'step', 'step' => 'Menganalisis pertanyaan Anda...'], $events[0]);
        $this->assertEquals(['type' => 'start'], $events[1]);

        // Find chunk events and combine them
        $chunks = array_filter($events, fn ($e) => $e['type'] === 'chunk');
        $this->assertNotEmpty($chunks);

        $combinedText = '';
        foreach ($chunks as $chunk) {
            $combinedText .= $chunk['text'];
        }

        // The text should be cleaned (no <function-name> tags)
        $this->assertStringContainsString('Halo, ini respon `GetProductsTool` dari asisten AI.', $combinedText);
        $this->assertStringNotContainsString('<function-name>', $combinedText);

        // Assert done event
        $doneEvent = end($events);
        $this->assertEquals('done', $doneEvent['type']);
        $this->assertEquals(['Pertanyaan 1', 'Pertanyaan 2', 'Pertanyaan 3'], $doneEvent['suggestions']);
        $this->assertEquals('Halo, ini respon `GetProductsTool` dari asisten AI.', $doneEvent['text']);
        $this->assertArrayHasKey('conversation_id', $doneEvent);
    }

    /**
     * Test listing, fetching messages, and deleting AI conversations.
     */
    public function test_can_manage_ai_sessions_in_database(): void
    {
        $user = $this->createOwner();

        // 1. Initially, user has no conversations
        $response = $this->actingAs($user)->getJson('/ai/sessions');
        $response->assertStatus(200);
        $response->assertJsonCount(0);

        // Run the agent stream to create a conversation in database
        RentalAssistant::fake(['Selamat datang! ---SARAN--- - Pertanyaan A']);

        ob_start();
        $response = $this->actingAs($user)->post('/ai/stream', [
            'message' => 'Halo pertama kali',
        ]);
        $response->sendContent();
        ob_end_clean();

        // 2. Listing should now return 1 conversation
        $response = $this->actingAs($user)->getJson('/ai/sessions');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $convId = $response->json()[0]['id'];
        $this->assertNotEmpty($convId);
        $this->assertEquals('Fake response for prompt: Halo pertama kali', $response->json()[0]['title']);

        // 3. Fetching messages should return user and assistant messages
        $response = $this->actingAs($user)->getJson("/ai/sessions/{$convId}/messages");
        $response->assertStatus(200);
        $response->assertJsonCount(2); // User and Assistant messages
        $response->assertJsonFragment(['role' => 'user', 'content' => 'Halo pertama kali']);
        $response->assertJsonFragment(['role' => 'assistant', 'content' => 'Selamat datang!']);

        // 4. Deleting the conversation
        $response = $this->actingAs($user)->deleteJson("/ai/sessions/{$convId}");
        $response->assertStatus(200);

        // 5. Listing should be empty again
        $response = $this->actingAs($user)->getJson('/ai/sessions');
        $response->assertStatus(200);
        $response->assertJsonCount(0);
    }

    /**
     * Test that the AI response cleaner successfully strips and formats XML-like function tags.
     */
    public function test_ai_response_cleaner_strips_xml_tags(): void
    {
        $controller = new AiAgentController;

        $reflection = new ReflectionMethod(AiAgentController::class, 'cleanAgentResponseText');
        $reflection->setAccessible(true);

        // Test cases: raw input vs expected clean markdown output
        $testCases = [
            'saya bisa membantu Anda dengan <function-name>GetProductsTool</function-name>.' => 'saya bisa membantu Anda dengan `GetProductsTool`.',
            'Silakan gunakan <function-name>GetRentalsTool</function-name> dengan parameter <function-args>{"status":"active"}</function-args>' => 'Silakan gunakan `GetRentalsTool` dengan parameter  ({"status":"active"})',
            '<call>membuka transaksi</call>' => 'membuka transaksi',
            'Tidak ada tag' => 'Tidak ada tag',
        ];

        foreach ($testCases as $raw => $expected) {
            $cleaned = $reflection->invoke($controller, $raw);
            $this->assertEquals($expected, $cleaned);
        }
    }
}
