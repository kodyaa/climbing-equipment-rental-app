<?php

namespace App\Ai\Tools;

use App\Models\Product;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class GetProductsTool implements Tool
{
    /**
     * Get the description of the tool's purpose.
     */
    public function description(): Stringable|string
    {
        return 'Mengambil daftar produk/alat sewa dari database. Bisa difilter berdasarkan kategori atau status, dan mendukung pencarian berdasarkan nama produk.';
    }

    /**
     * Execute the tool.
     */
    public function handle(Request $request): Stringable|string
    {
        $query = Product::query();

        if ($category = $request['category'] ?? null) {
            $query->where('category', $category);
        }

        if ($status = $request['status'] ?? null) {
            $query->where('status', $status);
        }

        if ($search = $request['search'] ?? null) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request['low_stock'] ?? false) {
            $query->where('stock', '<=', 5)->where('stock', '>', 0);
        }

        if ($request['out_of_stock'] ?? false) {
            $query->where('stock', 0);
        }

        $products = $query->orderBy('name')->get([
            'id', 'name', 'category', 'price_per_day', 'stock', 'status',
        ]);

        if ($products->isEmpty()) {
            return 'Tidak ada produk yang ditemukan dengan filter tersebut.';
        }

        $lines = $products->map(fn ($p) => sprintf(
            '- **%s** | Kategori: %s | Stok: %d | Harga/hari: Rp %s | Status: %s',
            $p->name,
            $p->category,
            $p->stock,
            number_format((float) $p->price_per_day, 0, ',', '.'),
            $p->status,
        ));

        return "**Daftar Produk ({$products->count()} item):**\n".$lines->implode("\n");
    }

    /**
     * Get the tool's schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'category' => $schema->string()->nullable()->description(
                'Filter berdasarkan kategori: Tents, Backpacks, Sleeping Bags, Footwear, Cooking Gear, Climbing Gear'
            ),
            'status' => $schema->string()->nullable()->description(
                'Filter berdasarkan status produk: available, unavailable'
            ),
            'search' => $schema->string()->nullable()->description(
                'Pencarian nama produk (partial match)'
            ),
            'low_stock' => $schema->boolean()->nullable()->description(
                'Jika true, tampilkan hanya produk dengan stok ≤ 5'
            ),
            'out_of_stock' => $schema->boolean()->nullable()->description(
                'Jika true, tampilkan hanya produk dengan stok = 0'
            ),
        ];
    }
}
