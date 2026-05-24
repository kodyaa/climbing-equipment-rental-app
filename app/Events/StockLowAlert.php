<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockLowAlert implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  array{id: int, name: string, category: string, stock: int}  $product
     */
    public function __construct(
        public readonly array $product
    ) {}

    /**
     * Broadcast on the shared operations channel for all staff.
     *
     * @return Channel[]
     */
    public function broadcastOn(): array
    {
        return [new Channel('ops')];
    }

    /**
     * Use a short, stable event name.
     */
    public function broadcastAs(): string
    {
        return 'stock.low';
    }

    /**
     * Data sent to the client.
     *
     * @return array{product: array{id: int, name: string, category: string, stock: int}}
     */
    public function broadcastWith(): array
    {
        return [
            'product' => $this->product,
        ];
    }
}
