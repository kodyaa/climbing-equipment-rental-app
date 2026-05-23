<?php

use App\Http\Controllers\AccountsController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\RentalsController;
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
        Route::apiResource('customers', CustomersController::class)->except(['show']);
    });

    // Both owner and kasir: rental transactions (kasir = daily operations)
    Route::middleware('role:owner|kasir')->group(function () {
        Route::apiResource('rentals', RentalsController::class)->only(['index', 'store']);
        Route::post('/rentals/{rental}/return', [RentalsController::class, 'return'])->name('rentals.return');
        Route::post('/rentals/{rental}/cancel', [RentalsController::class, 'cancel'])->name('rentals.cancel');
    });
});
