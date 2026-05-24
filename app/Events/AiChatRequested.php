<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AiChatRequested
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     */
    public function __construct(
        public int $userId,
        public string $message,
        public array $history,
        public string $requestId = ''
    ) {}
}
