<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Rental;
use App\Models\RentalItem;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard page with metrics, chart data, and recent rentals.
     */
    public function index(): Response
    {
        $now = Carbon::now();
        $startOfThisMonth = $now->copy()->startOfMonth();
        $endOfThisMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        // 1. Total Revenue
        $revenueThisMonth = (float) Rental::where('status', '!=', 'cancelled')
            ->whereBetween('rental_date', [$startOfThisMonth, $endOfThisMonth])
            ->sum('total_price');
        $revenueLastMonth = (float) Rental::where('status', '!=', 'cancelled')
            ->whereBetween('rental_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum('total_price');
        $totalRevenue = (float) Rental::where('status', '!=', 'cancelled')->sum('total_price');

        $revenueGrowth = $revenueLastMonth > 0
            ? (($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100
            : ($revenueThisMonth > 0 ? 100 : 0);

        // 2. Total Customers
        $customersThisMonth = Customer::whereBetween('created_at', [$startOfThisMonth, $endOfThisMonth])->count();
        $customersLastMonth = Customer::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();
        $totalCustomers = Customer::count();

        $customersGrowth = $customersLastMonth > 0
            ? (($customersThisMonth - $customersLastMonth) / $customersLastMonth) * 100
            : ($customersThisMonth > 0 ? 100 : 0);

        // 3. Active Rentals
        $activeRentalsThisMonth = Rental::where('status', 'active')
            ->whereBetween('rental_date', [$startOfThisMonth, $endOfThisMonth])
            ->count();
        $activeRentalsLastMonth = Rental::where('status', 'active')
            ->whereBetween('rental_date', [$startOfLastMonth, $endOfLastMonth])
            ->count();
        $activeRentalsCount = Rental::where('status', 'active')->count();

        $activeRentalsGrowth = $activeRentalsLastMonth > 0
            ? (($activeRentalsThisMonth - $activeRentalsLastMonth) / $activeRentalsLastMonth) * 100
            : ($activeRentalsThisMonth > 0 ? 100 : 0);

        // 4. Rented Items
        $itemsThisMonth = (int) RentalItem::join('rentals', 'rental_items.rental_id', '=', 'rentals.id')
            ->where('rentals.status', '!=', 'cancelled')
            ->whereBetween('rentals.rental_date', [$startOfThisMonth, $endOfThisMonth])
            ->sum('rental_items.quantity');
        $itemsLastMonth = (int) RentalItem::join('rentals', 'rental_items.rental_id', '=', 'rentals.id')
            ->where('rentals.status', '!=', 'cancelled')
            ->whereBetween('rentals.rental_date', [$startOfLastMonth, $endOfLastMonth])
            ->sum('rental_items.quantity');
        $totalItemsRented = (int) RentalItem::join('rentals', 'rental_items.rental_id', '=', 'rentals.id')
            ->where('rentals.status', '!=', 'cancelled')
            ->sum('rental_items.quantity');

        $itemsGrowth = $itemsLastMonth > 0
            ? (($itemsThisMonth - $itemsLastMonth) / $itemsLastMonth) * 100
            : ($itemsThisMonth > 0 ? 100 : 0);

        // Build Stats Array
        $stats = [
            'total_revenue' => [
                'value' => $totalRevenue,
                'growth' => round($revenueGrowth, 1),
                'trend' => $revenueGrowth >= 0 ? 'up' : 'down',
                'label' => $revenueGrowth >= 0 ? '+'.round($revenueGrowth, 1).'%' : round($revenueGrowth, 1).'%',
            ],
            'total_customers' => [
                'value' => $totalCustomers,
                'growth' => round($customersGrowth, 1),
                'trend' => $customersGrowth >= 0 ? 'up' : 'down',
                'label' => $customersGrowth >= 0 ? '+'.round($customersGrowth, 1).'%' : round($customersGrowth, 1).'%',
            ],
            'active_rentals' => [
                'value' => $activeRentalsCount,
                'growth' => round($activeRentalsGrowth, 1),
                'trend' => $activeRentalsGrowth >= 0 ? 'up' : 'down',
                'label' => $activeRentalsGrowth >= 0 ? '+'.round($activeRentalsGrowth, 1).'%' : round($activeRentalsGrowth, 1).'%',
            ],
            'items_rented' => [
                'value' => $totalItemsRented,
                'growth' => round($itemsGrowth, 1),
                'trend' => $itemsGrowth >= 0 ? 'up' : 'down',
                'label' => $itemsGrowth >= 0 ? '+'.round($itemsGrowth, 1).'%' : round($itemsGrowth, 1).'%',
            ],
        ];

        // Chart Data: daily cash vs qris revenue for the last 90 days.
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

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'chartData' => $chartData,
        ]);

    }
}
