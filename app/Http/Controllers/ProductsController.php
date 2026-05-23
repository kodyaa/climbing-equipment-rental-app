<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductsController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $category = $request->input('category');
        $status = $request->input('status');
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');

        // Ensure valid sort fields and directions
        $allowedSorts = ['id', 'name', 'category', 'price_per_day', 'stock', 'status'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'id';
        }
        if (! in_array($direction, ['asc', 'desc'])) {
            $direction = 'desc';
        }

        $products = Product::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Products', [
            'products' => Inertia::defer(fn () => $products),
            'filters' => [
                'search' => $search,
                'category' => $category,
                'status' => $status,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255', Rule::in(['Tent', 'Backpack', 'Sleeping Bag', 'Footwear', 'Cooking Gear', 'Climbing Gear'])],
            'description' => ['nullable', 'string'],
            'price_per_day' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'string', Rule::in(['available', 'maintenance', 'out_of_stock'])],
            'image' => $request->hasFile('image') ? ['image', 'max:2048'] : ['nullable', 'string'],
        ]);

        $imageUrl = null;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $imageUrl = '/storage/'.$path;
        } elseif ($request->filled('image')) {
            $imageUrl = $validated['image'];
        }

        Product::create([
            'name' => $validated['name'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'price_per_day' => $validated['price_per_day'],
            'stock' => $validated['stock'],
            'status' => $validated['status'],
            'image' => $imageUrl,
        ]);

        return redirect()->back()->with('success', 'Product created successfully!');
    }

    /**
     * Update the specified product in storage.
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255', Rule::in(['Tent', 'Backpack', 'Sleeping Bag', 'Footwear', 'Cooking Gear', 'Climbing Gear'])],
            'description' => ['nullable', 'string'],
            'price_per_day' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'string', Rule::in(['available', 'maintenance', 'out_of_stock'])],
            'image' => $request->hasFile('image') ? ['image', 'max:2048'] : ['nullable', 'string'],
        ]);

        $product->name = $validated['name'];
        $product->category = $validated['category'];
        $product->description = $validated['description'];
        $product->price_per_day = $validated['price_per_day'];
        $product->stock = $validated['stock'];
        $product->status = $validated['status'];

        if ($request->hasFile('image')) {
            if ($product->image && str_starts_with($product->image, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $product->image);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('products', 'public');
            $product->image = '/storage/'.$path;
        } elseif ($request->exists('image')) {
            $newImage = $validated['image'];
            if ($newImage !== $product->image) {
                if ($product->image && str_starts_with($product->image, '/storage/')) {
                    $oldPath = str_replace('/storage/', '', $product->image);
                    Storage::disk('public')->delete($oldPath);
                }
                $product->image = $newImage;
            }
        }

        $product->save();

        return redirect()->back()->with('success', 'Product updated successfully!');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        $name = $product->name;

        if ($product->image && str_starts_with($product->image, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $product->image);
            Storage::disk('public')->delete($oldPath);
        }

        $product->delete();

        return redirect()->back()->with('success', "{$name} has been deleted successfully.");
    }
}
