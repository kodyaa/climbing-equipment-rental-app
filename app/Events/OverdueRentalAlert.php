<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OverdueRentalAlert implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  array<int, array{rental_code: string, customer_name: string, expected_return_date: string, days_overdue: int}>  $rentals
     */
    public function __construct(
        public readonly int $overdueCount,
        public readonly array $rentals,
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
        return 'rental.overdue';
    }

    /**
     * Data sent to the client.
     *
     * @return array{overdue_count: int, rentals: array<int, array{rental_code: string, customer_name: string, expected_return_date: string, days_overdue: int}>}
     */
    public function broadcastWith(): array
    {
        return [
            'overdue_count' => $this->overdueCount,
            'rentals' => $this->rentals,
        ];
    }
}
