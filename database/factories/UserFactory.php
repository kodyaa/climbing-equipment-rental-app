<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'phone' => fake()->phoneNumber(),
            'country' => fake()->randomElement(['us', 'uk', 'ca', 'id']),
            'address' => fake()->address(),
            'avatar' => function (array $attributes) {
                return $this->micahAvatar($attributes['name'] ?? 'avatar');
            },
        ];
    }

    /**
     * Helper to get a secondary color for linear gradients.
     */
    private function getGradientColor(string $hex): string
    {
        if ($hex === 'default') {
            return 'default';
        }

        $cleanHex = str_replace('#', '', $hex);
        if (strlen($cleanHex) === 3) {
            $cleanHex = $cleanHex[0].$cleanHex[0].$cleanHex[1].$cleanHex[1].$cleanHex[2].$cleanHex[2];
        }

        if (strlen($cleanHex) !== 6) {
            return 'ffffff';
        }

        $r = hexdec(substr($cleanHex, 0, 2));
        $g = hexdec(substr($cleanHex, 2, 2));
        $b = hexdec(substr($cleanHex, 4, 2));

        $brightness = ($r * 299 + $g * 587 + $b * 114) / 1000;
        $factor = $brightness > 128 ? 0.75 : 1.3;

        $clamp = fn ($val) => max(0, min(255, (int) round($val)));
        $r2 = $clamp($r * $factor);
        $g2 = $clamp($g * $factor);
        $b2 = $clamp($b * $factor);

        return sprintf('%02x%02x%02x', $r2, $g2, $b2);
    }

    /**
     * Helper to generate a random Micah avatar URL.
     */
    public function micahAvatar(string $name, ?int $seedIndex = null): string
    {
        $seedIndex ??= fake()->numberBetween(0, 100);
        $seed = urlencode(trim($name).'-'.$seedIndex);

        $mouths = ['frown', 'laughing', 'nervous', 'pucker', 'sad', 'smile', 'smirk', 'surprised'];
        $mouth = fake()->randomElement($mouths);

        $shirtColors = ['6366f1', '3b82f6', 'ec4899', '10b981', 'f59e0b', 'ef4444', '8b5cf6'];
        $shirtColor = fake()->randomElement($shirtColors);

        $bgColors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'];
        $bgColor = fake()->randomElement($bgColors);
        $secondaryBg = $this->getGradientColor($bgColor);

        return "https://api.dicebear.com/9.x/micah/svg?seed={$seed}&backgroundType=gradientLinear&mouth={$mouth}&shirtColor={$shirtColor}&backgroundColor={$bgColor},{$secondaryBg}";
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
