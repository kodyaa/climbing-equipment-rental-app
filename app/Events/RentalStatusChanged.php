<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RentalStatusChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  'created'|'returned'|'cancelled'  $action
     */
    public function __construct(
        public readonly string $rentalCode,
        public readonly string $customerName,
        public readonly string $action,
        public readonly string $status,
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
        return 'rental.status';
    }

    /**
     * Data sent to the client.
     *
     * @return array{rental_code: string, customer_name: string, action: string, status: string}
     */
    public function broadcastWith(): array
    {
        return [
            'rental_code' => $this->rentalCode,
            'customer_name' => $this->customerName,
            'action' => $this->action,
            'status' => $this->status,
        ];
    }
}
