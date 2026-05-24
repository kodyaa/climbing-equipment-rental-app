<?php

use App\Http\Controllers\AccountsController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\RentalsController;
use App\Models\Wilayah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy']);

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    });

    // Owner only: user account management
    Route::middleware('role:owner')->group(function () {
        Route::apiResource('accounts', AccountsController::class)->except(['show'])->parameters(['accounts' => 'user']);
    });

    // Owner only: product catalog management (kasir has read-only via controller)
    Route::middleware('role:owner')->group(function () {
        Route::apiResource('products', ProductsController::class)->except(['show']);
    });

    // Both owner and kasir: customer management
    Route::middleware('role:owner|kasir')->group(function () {
        Route::get('/wilayah/search', function (Request $request) {
            $search = $request->query('search');
            if (strlen($search) < 2) {
                return response()->json([]);
            }

            return response()->json(
                Wilayah::query()
                    ->where('nama', 'like', "%{$search}%")
                    ->orWhere('kode', 'like', "{$search}%")
                    ->limit(20)
                    ->get()
            );
        })->name('wilayah.search');

        Route::get('/wilayah/children', function (Request $request) {
            $parent = $request->query('parent');

            if (! $parent) {
                $data = Wilayah::query()
                    ->whereRaw('LENGTH(kode) = 2')
                    ->orderBy('nama')
                    ->get();
            } else {
                $len = strlen($parent);
                if ($len === 2) {
                    $data = Wilayah::query()
                        ->whereRaw('LENGTH(kode) = 5')
                        ->where('kode', 'like', "{$parent}.%")
                        ->orderBy('nama')
                        ->get();
                } elseif ($len === 5) {
                    $data = Wilayah::query()
                        ->whereRaw('LENGTH(kode) = 8')
                        ->where('kode', 'like', "{$parent}.%")
                        ->orderBy('nama')
                        ->get();
                } elseif ($len === 8) {
                    $data = Wilayah::query()
                        ->whereRaw('LENGTH(kode) = 13')
                        ->where('kode', 'like', "{$parent}.%")
                        ->orderBy('nama')
                        ->get();
                } else {
                    $data = [];
                }
            }

            return response()->json($data);
        })->name('wilayah.children');

        Route::get('/customers/check-id', [CustomersController::class, 'checkIdNumber'])->name('customers.check-id');
        Route::apiResource('customers', CustomersController::class)->except(['show']);
    });

    // Both owner and kasir: rental transactions (kasir = daily operations)
    Route::middleware('role:owner|kasir')->group(function () {
        Route::get('/rentals/history', [RentalsController::class, 'history'])->name('rentals.history');
        Route::apiResource('rentals', RentalsController::class)->only(['index', 'store']);
        Route::post('/rentals/{rental}/return', [RentalsController::class, 'return'])->name('rentals.return');
        Route::post('/rentals/{rental}/cancel', [RentalsController::class, 'cancel'])->name('rentals.cancel');
    });
});
