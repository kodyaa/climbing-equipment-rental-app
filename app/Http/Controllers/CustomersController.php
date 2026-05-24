<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\JsonResponse;
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
            ->with(['wilayah'])
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
            'identity_photo' => ['nullable', 'file', 'image', 'max:2048'],
            'email' => ['nullable', 'email', 'max:255'],
            'wilayah_kode' => ['nullable', 'string', 'exists:wilayah,kode'],
            'address' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('identity_photo')) {
            $path = $request->file('identity_photo')->store('identities', 'public');
            $validated['identity_photo'] = '/storage/'.$path;
        }

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
            'identity_photo' => ['nullable'],
            'email' => ['nullable', 'email', 'max:255'],
            'wilayah_kode' => ['nullable', 'string', 'exists:wilayah,kode'],
            'address' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('identity_photo')) {
            $path = $request->file('identity_photo')->store('identities', 'public');
            $validated['identity_photo'] = '/storage/'.$path;
        }

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

    /**
     * Check if a customer ID number (NIK) already exists.
     */
    public function checkIdNumber(Request $request): JsonResponse
    {
        $idNumber = $request->query('id_number');
        $excludeId = $request->query('exclude_id');

        if (! $idNumber) {
            return response()->json(['exists' => false]);
        }

        $existingCustomer = Customer::query()
            ->where('id_number', $idNumber)
            ->when($excludeId, function ($query, $excludeId) {
                $query->where('id', '!=', $excludeId);
            })
            ->first();

        return response()->json([
            'exists' => $existingCustomer !== null,
            'name' => $existingCustomer?->name,
        ]);
    }

    /**
     * Check if a customer email address already exists.
     */
    public function checkEmail(Request $request): JsonResponse
    {
        $email = $request->query('email');
        $excludeId = $request->query('exclude_id');

        if (! $email) {
            return response()->json(['exists' => false]);
        }

        $existingCustomer = Customer::query()
            ->where('email', $email)
            ->when($excludeId, function ($query, $excludeId) {
                $query->where('id', '!=', $excludeId);
            })
            ->first();

        return response()->json([
            'exists' => $existingCustomer !== null,
            'name' => $existingCustomer?->name,
        ]);
    }
}
