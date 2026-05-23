<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Tent' => [
                'names' => ['Consina Magnum 4 Dome Tent', 'Naturehike Mongar Ultralight 2P', 'Eiger Guardian 4P Tent', 'Arei Forester 3P Tent'],
                'images' => [
                    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=400&q=80',
                ],
                'descriptions' => [
                    'A double-layer waterproof camping tent with alloy poles and spacious vestibule.',
                    'Ultralight 20D silicone nylon tent suitable for high altitude camping and heavy wind resistance.',
                ],
            ],
            'Backpack' => [
                'names' => ['Deuter Aircontact Lite 65+10', 'Eiger Rhinos 60L Carrier', 'Osprey Atmos AG 50', 'Consina Tarakan 55L'],
                'images' => [
                    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=400&q=80',
                ],
                'descriptions' => [
                    'Comfortable backpacking pack with an adjustable contact back system for optimal load distribution.',
                    'Durable hiking backpack with raincover, padded shoulder straps, and multiple organizer pockets.',
                ],
            ],
            'Sleeping Bag' => [
                'names' => ['Consina Polar Warm SB', 'Deuter Orbit 0 Synthetic SB', 'Eiger Mummy SB', 'Naturehike Envelope SB'],
                'images' => [
                    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=400&q=80',
                ],
                'descriptions' => [
                    'Polar fleece lined sleeping bag keeping you warm in temperatures down to 5 degrees Celsius.',
                    'Ergonomic mummy-style synthetic fill sleeping bag for dry warmth and draft protection.',
                ],
            ],
            'Footwear' => [
                'names' => ['Karrimor Mount Mid Waterproof Boots', 'Eiger Tiger Claw Hiking Shoes', 'Columbia Newton Ridge Boots', 'Salomon Quest 4D GTX'],
                'images' => [
                    'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80',
                ],
                'descriptions' => [
                    'Waterproof and breathable hiking boots with a dynagrip outsole for traction on muddy trails.',
                    'High-cut trekking boots engineered for heavy support and stability over rough mountainous terrain.',
                ],
            ],
            'Cooking Gear' => [
                'names' => ['Naturehike Nest Cookset & Stove', 'Kovea Portable Gas Stove', 'Arei Camp Cooking Pot Kit', 'Alocs Cookware Set'],
                'images' => [
                    'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1595856169990-ac9b49f75510?auto=format&fit=crop&w=400&q=80',
                ],
                'descriptions' => [
                    'Compact nested anodized aluminum pots with a high-efficiency folding canister stove.',
                    'Windproof outdoor stove head with self-igniting piezostart and a multi-person cookset combo.',
                ],
            ],
            'Climbing Gear' => [
                'names' => ['Petzl Boreo Helmet', 'Black Diamond Momentum Harness', 'Mad Rock Climbing Shoes', 'Mammut 9.8mm Dynamic Rope'],
                'images' => [
                    'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=400&q=80',
                    'https://images.unsplash.com/photo-1564758564527-b97d79cb27c1?auto=format&fit=crop&w=400&q=80',
                ],
                'descriptions' => [
                    'Reinforced top and side protection helmet for rock climbing, mountaineering, and via ferrata.',
                    'Comfortable 4-buckle adjustable harness with speed-adjust waistbelt and gear loops.',
                ],
            ],
        ];

        $category = fake()->randomElement(array_keys($categories));
        $gearInfo = $categories[$category];

        $name = fake()->randomElement($gearInfo['names']);
        $image = fake()->randomElement($gearInfo['images']);
        $description = fake()->randomElement($gearInfo['descriptions']);

        return [
            'name' => $name,
            'category' => $category,
            'description' => $description,
            'price_per_day' => fake()->randomFloat(2, 10000, 150000), // Range between Rp10,000 to Rp150,000 (typical IDR rates)
            'stock' => fake()->numberBetween(2, 15),
            'status' => fake()->randomElement(['available', 'maintenance', 'out_of_stock']),
            'image' => $image,
        ];
    }
}
