<?php

namespace App\Ai\Tools;

use App\Models\Rental;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetRentalsTool implements Tool
{
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Mengambil daftar transaksi sewa (rental) dari database. Bisa difilter berdasarkan status, kode transaksi, nama pelanggan, atau rentang tanggal.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $query = Rental::with(['customer', 'cashier'])->withCount('items');

        if ($status = $request['status'] ?? null) {
            $query->where('status', $status);
        }

        if ($code = $request['rental_code'] ?? null) {
            $query->where('rental_code', 'like', "%{$code}%");
        }

        if ($customerName = $request['customer_name'] ?? null) {
            $query->whereHas('customer', fn ($q) => $q->where('name', 'like', "%{$customerName}%"));
        }

        if ($dateFrom = $request['date_from'] ?? null) {
            $query->whereDate('rental_date', '>=', $dateFrom);
        }

        if ($dateTo = $request['date_to'] ?? null) {
            $query->whereDate('rental_date', '<=', $dateTo);
        }

        if ($request['overdue'] ?? false) {
            $query->where('status', 'active')
                ->whereDate('expected_return_date', '<', today());
        }

        $limit = min($request->integer('limit', 10), 30);
        $rentals = $query->latest('rental_date')->limit($limit)->get();

        if ($rentals->isEmpty()) {
            return 'Tidak ada transaksi sewa yang ditemukan dengan filter tersebut.';
        }

        $lines = $rentals->map(fn ($r) => sprintf(
            '- **%s** | Pelanggan: %s | Tanggal: %s | Kembali: %s | Total: Rp %s | Status: %s | Item: %d',
            $r->rental_code,
            $r->customer?->name ?? '-',
            $r->rental_date?->format('d/m/Y') ?? '-',
            $r->expected_return_date?->format('d/m/Y') ?? '-',
            number_format((float) $r->total_price, 0, ',', '.'),
            $r->status,
            $r->items_count,
        ));

        return "**Daftar Transaksi Sewa ({$rentals->count()} transaksi):**\n".$lines->implode("\n");
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'status' => $schema->string()->nullable()->description(
                'Filter status: active (sedang disewa), returned (sudah dikembalikan), cancelled (dibatalkan)'
            ),
            'rental_code' => $schema->string()->nullable()->description(
                'Cari berdasarkan kode transaksi (misal: TRX-20240524-0001)'
            ),
            'customer_name' => $schema->string()->nullable()->description(
                'Cari berdasarkan nama pelanggan'
            ),
            'date_from' => $schema->string()->nullable()->description(
                'Filter dari tanggal sewa (format: YYYY-MM-DD)'
            ),
            'date_to' => $schema->string()->nullable()->description(
                'Filter sampai tanggal sewa (format: YYYY-MM-DD)'
            ),
            'overdue' => $schema->boolean()->nullable()->description(
                'Jika true, tampilkan hanya sewa yang melewati batas waktu pengembalian'
            ),
            'limit' => $schema->integer()->nullable()->description(
                'Jumlah maksimal transaksi yang dikembalikan (default: 10, maks: 30)'
            ),
        ];
    }
}
