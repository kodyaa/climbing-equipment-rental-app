<?php

namespace App\Http\Controllers;

use App\Models\RentalItem;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display the analytics page with dynamic radar chart data.
     */
    public function index(): Response
    {
        $categories = [
            'Tent' => 0,
            'Backpack' => 0,
            'Sleeping Bag' => 0,
            'Footwear' => 0,
            'Cooking Gear' => 0,
            'Climbing Gear' => 0,
        ];

        // Sum quantities of items rented by category (ignoring cancelled rentals)
        $rentedQuantities = RentalItem::join('products', 'rental_items.product_id', '=', 'products.id')
            ->join('rentals', 'rental_items.rental_id', '=', 'rentals.id')
            ->where('rentals.status', '!=', 'cancelled')
            ->selectRaw('products.category, SUM(rental_items.quantity) as total_quantity')
            ->groupBy('products.category')
            ->get();

        foreach ($rentedQuantities as $item) {
            $cat = $item->category;
            if (array_key_exists($cat, $categories)) {
                $categories[$cat] = (int) $item->total_quantity;
            }
        }

        $radarData = [];
        foreach ($categories as $catName => $qty) {
            $radarData[] = [
                'category' => $catName,
                'rentals' => $qty,
            ];
        }

        return Inertia::render('Analytics', [
            'radarData' => $radarData,
        ]);
    }
}
