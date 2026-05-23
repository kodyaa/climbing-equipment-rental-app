<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            // Tents
            [
                'name' => 'Consina Magnum 4 Dome Tent',
                'category' => 'Tent',
                'description' => 'A classic double-layer waterproof dome tent that comfortably sleeps up to 4 adults. Featuring alloy poles and a small vestibule.',
                'price_per_day' => 45000.00,
                'stock' => 8,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Naturehike Mongar Ultralight 2P',
                'category' => 'Tent',
                'description' => 'Super lightweight 2-person freestanding tent made of 20D silicone nylon. Ideal for high altitude backpacking and heavy winds.',
                'price_per_day' => 65000.00,
                'stock' => 5,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=400&q=80',
            ],

            // Backpacks
            [
                'name' => 'Deuter Aircontact Lite 65+10',
                'category' => 'Backpack',
                'description' => 'Premium, heavy-duty trekking backpack featuring the functional Aircontact back system for maximum comfort and ventilation.',
                'price_per_day' => 55000.00,
                'stock' => 10,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Eiger Rhinos 60L Carrier',
                'category' => 'Backpack',
                'description' => 'Standard rugged outdoor backpacking carrier, equipped with a raincover, padded straps, and multiple access zippers.',
                'price_per_day' => 40000.00,
                'stock' => 12,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=400&q=80',
            ],

            // Sleeping Bags
            [
                'name' => 'Consina Polar Warm SB',
                'category' => 'Sleeping Bag',
                'description' => 'Thick and comfortable polar fleece lined sleeping bag keeping you warm down to 5°C. Features a full-length side zipper.',
                'price_per_day' => 15000.00,
                'stock' => 15,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Deuter Orbit 0 Synthetic SB',
                'category' => 'Sleeping Bag',
                'description' => 'An easy-care and robust mummy-style synthetic fill sleeping bag for dry warmth and reliable draft protection.',
                'price_per_day' => 25000.00,
                'stock' => 6,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=400&q=80',
            ],

            // Footwear
            [
                'name' => 'Karrimor Mount Mid Waterproof Boots',
                'category' => 'Footwear',
                'description' => 'Waterproof and breathable mid-cut hiking boots with a dynagrip outsole for heavy traction on rocky or muddy trails.',
                'price_per_day' => 30000.00,
                'stock' => 6,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Eiger Tiger Claw Hiking Shoes',
                'category' => 'Footwear',
                'description' => 'Engineered for durability and stability over rough mountainous terrain, featuring reinforced toe cap guards.',
                'price_per_day' => 35000.00,
                'stock' => 8,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=400&q=80',
            ],

            // Cooking Gear
            [
                'name' => 'Naturehike Nest Cookset & Stove',
                'category' => 'Cooking Gear',
                'description' => 'Extremely compact nested anodized aluminum pots and pans set paired with a high-efficiency folding canister stove.',
                'price_per_day' => 20000.00,
                'stock' => 14,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Kovea Portable Gas Stove',
                'category' => 'Cooking Gear',
                'description' => 'Heavy-duty windproof outdoor stove head with self-igniting piezo ignition. Extremely reliable and compact.',
                'price_per_day' => 12000.00,
                'stock' => 10,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1595856169990-ac9b49f75510?auto=format&fit=crop&w=400&q=80',
            ],

            // Climbing Gear
            [
                'name' => 'Petzl Boreo Climbing Helmet',
                'category' => 'Climbing Gear',
                'description' => 'Reinforced top and side protection safety helmet for rock climbing, mountaineering, caving, and via ferrata.',
                'price_per_day' => 25000.00,
                'stock' => 5,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=400&q=80',
            ],
            [
                'name' => 'Black Diamond Momentum Harness',
                'category' => 'Climbing Gear',
                'description' => 'Highly comfortable 4-buckle adjustable rock climbing harness with speed-adjust waistbelt and 4 pressure-molded gear loops.',
                'price_per_day' => 30000.00,
                'stock' => 4,
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1564758564527-b97d79cb27c1?auto=format&fit=crop&w=400&q=80',
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
