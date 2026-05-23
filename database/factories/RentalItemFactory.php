<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Rental;
use App\Models\RentalItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RentalItem>
 */
class RentalItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 3);
        $durationDays = fake()->numberBetween(1, 7);
        $pricePerDay = fake()->randomFloat(2, 10000, 150000);
        $subtotal = $quantity * $durationDays * $pricePerDay;

        return [
            'rental_id'     => Rental::factory(),
            'product_id'    => Product::factory(),
            'quantity'      => $quantity,
            'duration_days' => $durationDays,
            'price_per_day' => $pricePerDay,
            'subtotal'      => $subtotal,
        ];
    }
}
