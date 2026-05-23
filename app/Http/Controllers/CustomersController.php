<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomersController extends Controller
{
    /**
     * Display a listing of customers.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');

        $allowedSorts = ['id', 'name', 'phone', 'email'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'id';
        }
        if (! in_array($direction, ['asc', 'desc'])) {
            $direction = 'desc';
        }

        $customers = Customer::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('id_number', 'like', "%{$search}%");
                });
            })
            ->withCount('rentals')
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customers', [
            'customers' => Inertia::defer(fn () => $customers),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'id_number' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
        ]);

        Customer::create($validated);

        return redirect()->back()->with('success', 'Customer added successfully.');
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'id_number' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
        ]);

        $customer->update($validated);

        return redirect()->back()->with('success', "{$customer->name} updated successfully.");
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(Customer $customer): RedirectResponse
    {
        $name = $customer->name;
        $customer->delete();

        return redirect()->back()->with('success', "{$name} has been deleted.");
    }
}
