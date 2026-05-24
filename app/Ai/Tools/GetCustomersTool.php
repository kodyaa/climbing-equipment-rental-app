<?php

namespace App\Ai\Tools;

use App\Models\Customer;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetCustomersTool implements Tool
{
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Mengambil daftar pelanggan (customer) dari database. Bisa mencari berdasarkan nama, nomor telepon, atau nomor identitas.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $query = Customer::query();

        if ($search = $request->string('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('id_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $limit = min($request->integer('limit', 10), 50);
        $customers = $query->withCount('rentals')
            ->orderBy('name')
            ->limit($limit)
            ->get(['id', 'name', 'phone', 'email', 'id_number', 'address']);

        if ($customers->isEmpty()) {
            return 'Tidak ada pelanggan yang ditemukan.';
        }

        $lines = $customers->map(fn ($c) => sprintf(
            '- **%s** | Telp: %s | Email: %s | ID: %s | Total Sewa: %d kali',
            $c->name,
            $c->phone ?? '-',
            $c->email ?? '-',
            $c->id_number ?? '-',
            $c->rentals_count,
        ));

        return "**Daftar Pelanggan ({$customers->count()} data):**\n".$lines->implode("\n");
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'search' => $schema->string()->nullable()->description(
                'Cari pelanggan berdasarkan nama, nomor telepon, email, atau nomor identitas'
            ),
            'limit' => $schema->integer()->nullable()->description(
                'Jumlah maksimal data yang dikembalikan (default: 10, maks: 50)'
            ),
        ];
    }
}
