<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Rental>
 */
class RentalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $rentalDate = fake()->dateTimeBetween('-3 months', 'now');
        $durationDays = fake()->numberBetween(1, 7);
        $expectedReturn = (clone $rentalDate)->modify("+{$durationDays} days");

        return [
            'customer_id'          => Customer::factory(),
            'user_id'              => User::factory(),
            'rental_code'          => 'TRX-' . fake()->unique()->numerify('########'),
            'rental_date'          => $rentalDate->format('Y-m-d'),
            'expected_return_date' => $expectedReturn->format('Y-m-d'),
            'returned_at'          => null,
            'total_price'          => 0,
            'status'               => 'active',
            'notes'                => fake()->optional(0.4)->sentence(),
        ];
    }

    /**
     * State for a returned rental.
     */
    public function returned(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'status'      => 'returned',
                'returned_at' => now(),
            ];
        });
    }

    /**
     * State for an overdue rental.
     */
    public function overdue(): static
    {
        return $this->state(fn () => [
            'status'               => 'overdue',
            'expected_return_date' => now()->subDays(fake()->numberBetween(1, 14))->format('Y-m-d'),
            'returned_at'          => null,
        ]);
    }
}
