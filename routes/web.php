<?php

use App\Http\Controllers\AccountsController;
use App\Http\Controllers\AiAgentController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CustomersController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductsController;
use App\Http\Controllers\RentalsController;
use App\Http\Controllers\WilayahController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy']);

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics');
    Route::post('/ai/chat', [AiAgentController::class, 'chat'])->name('ai.chat');

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
        Route::get('/wilayah/search', [WilayahController::class, 'search'])->name('wilayah.search');
        Route::get('/wilayah/children', [WilayahController::class, 'children'])->name('wilayah.children');

        Route::get('/customers/check-id', [CustomersController::class, 'checkIdNumber'])->name('customers.check-id');
        Route::get('/customers/check-email', [CustomersController::class, 'checkEmail'])->name('customers.check-email');
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
