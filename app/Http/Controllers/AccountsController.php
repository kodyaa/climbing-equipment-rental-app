<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AccountsController extends Controller
{
    /**
     * Display a listing of the accounts.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $sort = $request->input('sort', 'id');
        $direction = $request->input('direction', 'desc');

        // Ensure valid sort fields and directions
        $allowedSorts = ['id', 'name', 'email'];
        if (! in_array($sort, $allowedSorts)) {
            $sort = 'id';
        }
        if (! in_array($direction, ['asc', 'desc'])) {
            $direction = 'desc';
        }

        $accounts = User::query()
            ->with(['roles', 'permissions'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->paginate(5)
            ->withQueryString()
            ->through(fn ($u) => array_merge($u->toArray(), [
                'role' => $u->roles->first()?->name ?? 'kasir',
                'permissions' => $u->permissions->pluck('name')->toArray(),
            ]));

        // All kasir permissions for the checkbox list
        $kasirPermissions = [
            'products.view', 'customers.view', 'customers.create',
            'customers.update', 'customers.delete', 'rentals.view',
            'rentals.create', 'rentals.return', 'rentals.cancel',
        ];

        return Inertia::render('Accounts', [
            'accounts' => Inertia::defer(fn () => $accounts),
            'kasirPermissions' => $kasirPermissions,
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Store a newly created account in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'phone' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'avatar' => $request->hasFile('avatar') ? ['image', 'max:2048'] : ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['nullable', 'string', 'in:owner,kasir'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $avatarUrl = null;

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $avatarUrl = '/storage/'.$path;
        } elseif ($request->filled('avatar')) {
            $avatarUrl = $validated['avatar'];
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'country' => $validated['country'],
            'address' => $validated['address'],
            'avatar' => $avatarUrl,
            'password' => Hash::make($validated['password'] ?? 'password'),
        ]);

        $role = $validated['role'] ?? 'kasir';
        $user->assignRole($role);

        // For kasir role, sync custom permissions if provided
        if ($role === 'kasir' && ! empty($validated['permissions'])) {
            $allowed = [
                'products.view', 'customers.view', 'customers.create',
                'customers.update', 'customers.delete', 'rentals.view',
                'rentals.create', 'rentals.return', 'rentals.cancel',
            ];
            $permissions = array_intersect($validated['permissions'], $allowed);
            $user->syncPermissions($permissions);
        }

        return redirect()->back()->with('success', 'Account created successfully!');
    }

    /**
     * Update the specified account in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'avatar' => $request->hasFile('avatar') ? ['image', 'max:2048'] : ['nullable', 'string'],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['nullable', 'string', 'in:owner,kasir'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string'],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'];
        $user->country = $validated['country'];
        $user->address = $validated['address'];

        if ($request->hasFile('avatar')) {
            if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                $oldPath = str_replace('/storage/', '', $user->avatar);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = '/storage/'.$path;
        } elseif ($request->exists('avatar')) {
            $newAvatar = $validated['avatar'];
            if ($newAvatar !== $user->avatar) {
                if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
                    $oldPath = str_replace('/storage/', '', $user->avatar);
                    Storage::disk('public')->delete($oldPath);
                }
                $user->avatar = $newAvatar;
            }
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // Sync role
        $role = $validated['role'] ?? ($user->roles->first()?->name ?? 'kasir');
        $user->syncRoles([$role]);

        // For kasir, sync custom permissions if provided
        if ($role === 'kasir' && ! empty($validated['permissions'])) {
            $allowed = [
                'products.view', 'customers.view', 'customers.create',
                'customers.update', 'customers.delete', 'rentals.view',
                'rentals.create', 'rentals.return', 'rentals.cancel',
            ];
            $permissions = array_intersect($validated['permissions'], $allowed);
            $user->syncPermissions($permissions);
        } elseif ($role === 'owner') {
            // Owner gets all permissions via role, clear any direct user permissions
            $user->syncPermissions([]);
        }

        return redirect()->back()->with('success', 'Account updated successfully!');
    }

    /**
     * Remove the specified account from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $name = $user->name;

        if ($user->avatar && str_starts_with($user->avatar, '/storage/')) {
            $oldPath = str_replace('/storage/', '', $user->avatar);
            Storage::disk('public')->delete($oldPath);
        }

        $user->delete();

        return redirect()->back()->with('success', "{$name}'s account has been deleted.");
    }
}
