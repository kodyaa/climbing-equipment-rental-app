<?php

namespace App\Console\Commands;

use App\Events\OverdueRentalAlert;
use App\Models\Rental;
use Illuminate\Console\Command;

class BroadcastOverdueRentals extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rentals:broadcast-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Broadcast a real-time alert for all active rentals past their expected return date';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $overdueRentals = Rental::query()
            ->with('customer:id,name')
            ->where('status', 'active')
            ->whereDate('expected_return_date', '<', today())
            ->get(['id', 'rental_code', 'customer_id', 'expected_return_date']);

        if ($overdueRentals->isEmpty()) {
            $this->info('No overdue rentals found.');

            return self::SUCCESS;
        }

        $payload = $overdueRentals->map(fn ($rental) => [
            'rental_code' => $rental->rental_code,
            'customer_name' => $rental->customer?->name ?? 'Unknown',
            'expected_return_date' => $rental->expected_return_date->format('d/m/Y'),
            'days_overdue' => (int) $rental->expected_return_date->diffInDays(today()),
        ])->all();

        OverdueRentalAlert::dispatch($overdueRentals->count(), $payload);

        $this->info("Broadcasted overdue alert for {$overdueRentals->count()} rental(s).");

        return self::SUCCESS;
    }
}
