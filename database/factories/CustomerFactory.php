<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'      => fake()->name(),
            'phone'     => fake()->numerify('08##########'),
            'id_number' => fake()->numerify('################'), // 16-digit KTP-like number
            'email'     => fake()->optional(0.7)->safeEmail(),
            'address'   => fake()->optional(0.8)->address(),
        ];
    }
}
