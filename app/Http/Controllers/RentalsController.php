<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Rental;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RentalsController extends Controller
{
    /**
     * Display a listing of rentals (kasir dashboard).
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');

        $allowedSorts = ['id', 'rental_code', 'rental_date', 'expected_return_date', 'total_price', 'status'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'id';
        }
        if (! in_array($direction, ['asc', 'desc'])) {
            $direction = 'desc';
        }

        $rentals = Rental::query()
            ->with(['customer:id,name,phone', 'cashier:id,name', 'items.product:id,name'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('rental_code', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString();

        // Available products for the rental form
        $availableProducts = Inertia::defer(fn () => Product::query()
            ->where('status', 'available')
            ->where('stock', '>', 0)
            ->select(['id', 'name', 'category', 'price_per_day', 'stock'])
            ->orderBy('name')
            ->get()
        );

        $customers = Inertia::defer(fn () => Customer::query()
            ->select(['id', 'name', 'phone'])
            ->orderBy('name')
            ->get()
        );

        return Inertia::render('Rentals', [
            'rentals' => Inertia::defer(fn () => $rentals),
            'availableProducts' => $availableProducts,
            'customers' => $customers,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Store a new rental transaction.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'rental_date' => ['required', 'date'],
            'expected_return_date' => ['required', 'date', 'after_or_equal:rental_date'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.duration_days' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $totalPrice = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $item['quantity'] * $item['duration_days'] * $product->price_per_day;
                $totalPrice += $subtotal;

                // Decrement stock
                $product->decrement('stock', $item['quantity']);
                if ($product->stock <= 0) {
                    $product->update(['status' => 'out_of_stock']);
                }

                $itemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'duration_days' => $item['duration_days'],
                    'price_per_day' => $product->price_per_day,
                    'subtotal' => $subtotal,
                ];
            }

            $rental = Rental::create([
                'customer_id' => $validated['customer_id'],
                'user_id' => $request->user()->id,
                'rental_code' => Rental::generateCode(),
                'rental_date' => $validated['rental_date'],
                'expected_return_date' => $validated['expected_return_date'],
                'total_price' => $totalPrice,
                'notes' => $validated['notes'] ?? null,
                'status' => 'active',
            ]);

            $rental->items()->createMany($itemsData);
        });

        return redirect()->back()->with('success', 'Rental transaction created successfully.');
    }

    /**
     * Mark a rental as returned and restore product stock.
     */
    public function return(Rental $rental): RedirectResponse
    {
        if ($rental->status === 'returned') {
            return redirect()->back()->with('error', 'This rental has already been returned.');
        }

        DB::transaction(function () use ($rental) {
            foreach ($rental->items as $item) {
                $item->product->increment('stock', $item->quantity);
                if ($item->product->status === 'out_of_stock') {
                    $item->product->update(['status' => 'available']);
                }
            }

            $rental->update([
                'status' => 'returned',
                'returned_at' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Rental {$rental->rental_code} marked as returned.");
    }

    /**
     * Cancel a rental and restore product stock.
     */
    public function cancel(Rental $rental): RedirectResponse
    {
        if (in_array($rental->status, ['returned', 'cancelled'])) {
            return redirect()->back()->with('error', 'This rental cannot be cancelled.');
        }

        DB::transaction(function () use ($rental) {
            $rental->load('items.product');

            foreach ($rental->items as $item) {
                $item->product->increment('stock', $item->quantity);
                if ($item->product->status === 'out_of_stock') {
                    $item->product->update(['status' => 'available']);
                }
            }

            $rental->update(['status' => 'cancelled']);
        });

        return redirect()->back()->with('success', "Rental {$rental->rental_code} has been cancelled.");
    }
}
