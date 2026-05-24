<?php

namespace App\Ai\Tools;

use App\Models\Product;
use App\Models\Rental;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetRentalSummaryTool implements Tool
{
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Mengambil ringkasan statistik dan laporan operasional: total pendapatan, jumlah transaksi, produk terlaris, dan stok produk. Gunakan untuk menjawab pertanyaan tentang laporan harian/bulanan/total.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $period = $request['period'] ?? 'today';
        if ($period === '') {
            $period = 'today';
        }

        $dateRange = match ($period) {
            'today' => [today(), today()],
            'this_week' => [now()->startOfWeek(), now()->endOfWeek()],
            'this_month' => [now()->startOfMonth(), now()->endOfMonth()],
            'last_month' => [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()],
            default => [today(), today()],
        };

        [$from, $to] = $dateRange;
        $periodLabel = match ($period) {
            'today' => 'Hari Ini ('.today()->format('d/m/Y').')',
            'this_week' => 'Minggu Ini',
            'this_month' => 'Bulan Ini ('.now()->format('F Y').')',
            'last_month' => 'Bulan Lalu',
            default => 'Hari Ini',
        };

        // Rental stats for the period
        $rentalsInPeriod = Rental::whereBetween('rental_date', [$from, $to]);
        $totalRevenue = (clone $rentalsInPeriod)->where('status', '!=', 'cancelled')->sum('total_price');
        $totalTransactions = (clone $rentalsInPeriod)->count();
        $activeRentals = Rental::where('status', 'active')->count();
        $overdueRentals = Rental::where('status', 'active')
            ->whereDate('expected_return_date', '<', today())
            ->count();

        // Product stats
        $lowStockCount = Product::where('stock', '<=', 5)->where('stock', '>', 0)->count();
        $outOfStockCount = Product::where('stock', 0)->count();

        // Top rented products (all time)
        $topProducts = Product::withCount(['rentalItems as total_rented' => fn ($q) => $q->whereHas('rental', fn ($r) => $r->where('status', '!=', 'cancelled'))])
            ->orderByDesc('total_rented')
            ->limit(5)
            ->get(['name', 'category', 'stock']);

        $summary = [];
        $summary[] = "## Ringkasan Operasional — {$periodLabel}";
        $summary[] = '';
        $summary[] = '### 📊 Transaksi Sewa';
        $summary[] = '- **Total Transaksi:** '.$totalTransactions.' transaksi';
        $summary[] = '- **Pendapatan:** Rp '.number_format((float) $totalRevenue, 0, ',', '.');
        $summary[] = '- **Aktif Disewa:** '.$activeRentals.' transaksi';
        if ($overdueRentals > 0) {
            $summary[] = '- ⚠️ **Terlambat Dikembalikan:** '.$overdueRentals.' transaksi';
        }
        $summary[] = '';
        $summary[] = '### 📦 Stok Produk';
        $summary[] = '- **Stok Hampir Habis (≤5):** '.$lowStockCount.' produk';
        $summary[] = '- **Stok Habis:** '.$outOfStockCount.' produk';

        if ($topProducts->isNotEmpty()) {
            $summary[] = '';
            $summary[] = '### 🏆 Produk Paling Sering Disewa';
            foreach ($topProducts as $p) {
                $summary[] = '- **'.$p->name.'** ('.$p->category.') — disewa '.$p->total_rented.' kali | Stok: '.$p->stock;
            }
        }

        return implode("\n", $summary);
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'period' => $schema->string()->nullable()->description(
                'Periode laporan: today (hari ini), this_week (minggu ini), this_month (bulan ini), last_month (bulan lalu). Default: today'
            ),
        ];
    }
}
