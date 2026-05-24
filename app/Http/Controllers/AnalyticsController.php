<?php

namespace App\Http\Controllers;

use App\Models\Rental;
use App\Models\RentalItem;
use Carbon\Carbon;
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

        // Daily Cash vs QRIS revenue comparison over the last 90 days
        $now = Carbon::now();
        $chartDataRaw = Rental::where('status', '!=', 'cancelled')
            ->where('rental_date', '>=', $now->copy()->subDays(90))
            ->selectRaw('rental_date, payment_type, SUM(total_price) as total')
            ->groupBy('rental_date', 'payment_type')
            ->orderBy('rental_date')
            ->get();

        $chartDataMap = [];
        foreach ($chartDataRaw as $row) {
            $dateStr = Carbon::parse($row->rental_date)->format('Y-m-d');
            if (! isset($chartDataMap[$dateStr])) {
                $chartDataMap[$dateStr] = ['cash' => 0.0, 'qris' => 0.0];
            }
            $type = strtolower($row->payment_type);
            if ($type === 'cash' || $type === 'qris') {
                $chartDataMap[$dateStr][$type] += (float) $row->total;
            }
        }

        $chartData = [];
        for ($i = 90; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $chartData[] = [
                'date' => $dateStr,
                'cash' => $chartDataMap[$dateStr]['cash'] ?? 0.0,
                'qris' => $chartDataMap[$dateStr]['qris'] ?? 0.0,
            ];
        }

        // Count rentals by status (excluding cancelled) grouped by month for the last 6 months
        $sixMonthsAgo = $now->copy()->subMonths(5)->startOfMonth();
        $rentals = Rental::where('status', '!=', 'cancelled')
            ->where('rental_date', '>=', $sixMonthsAgo)
            ->select('rental_date', 'status')
            ->get();

        $pieDataMap = [];
        // Seed the last 6 months to ensure they always exist in the map
        for ($i = 5; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i);
            $monthName = strtolower($m->format('F')); // e.g. "january"
            $pieDataMap[$monthName] = [
                'active' => 0,
                'returned' => 0,
                'overdue' => 0,
            ];
        }

        foreach ($rentals as $rental) {
            $monthName = strtolower(Carbon::parse($rental->rental_date)->format('F'));
            if (isset($pieDataMap[$monthName])) {
                $status = strtolower($rental->status);
                if (array_key_exists($status, $pieDataMap[$monthName])) {
                    $pieDataMap[$monthName][$status]++;
                }
            }
        }

        $pieData = [];
        foreach ($pieDataMap as $monthName => $statuses) {
            $pieData[] = [
                'month' => $monthName,
                'active' => $statuses['active'],
                'returned' => $statuses['returned'],
                'overdue' => $statuses['overdue'],
                'total' => $statuses['active'] + $statuses['returned'] + $statuses['overdue'],
            ];
        }

        return Inertia::render('Analytics', [
            'radarData' => $radarData,
            'chartData' => $chartData,
            'pieData' => $pieData,
        ]);
    }
}
