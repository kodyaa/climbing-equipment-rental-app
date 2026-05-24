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
    Route::post('/ai/chat', [AiAgentController::class, 'chat'])->name('ai.chat');
    Route::post('/ai/stream', [AiAgentController::class, 'stream'])->name('ai.stream');
    Route::get('/ai/sessions', [AiAgentController::class, 'sessions'])->name('ai.sessions');
    Route::get('/ai/sessions/{id}/messages', [AiAgentController::class, 'messages'])->name('ai.sessions.messages');
    Route::delete('/ai/sessions/{id}', [AiAgentController::class, 'deleteSession'])->name('ai.sessions.delete');

    // ─── Products & Catalog ──────────────────────────────────────────────────
    Route::middleware('permission:products.view')->group(function () {
        Route::get('/products', [ProductsController::class, 'index'])->name('products.index');
    });
    Route::middleware('permission:products.create')->group(function () {
        Route::post('/products', [ProductsController::class, 'store'])->name('products.store');
    });
    Route::middleware('permission:products.update')->group(function () {
        Route::put('/products/{product}', [ProductsController::class, 'update'])->name('products.update');
    });
    Route::middleware('permission:products.delete')->group(function () {
        Route::delete('/products/{product}', [ProductsController::class, 'destroy'])->name('products.destroy');
    });

    // ─── Business Analytics & Dashboard (Owner exclusive) ────────────────────
    Route::middleware('role:owner')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics');
    });

    // ─── Accounts Management ─────────────────────────────────────────────────
    Route::middleware('permission:accounts.view')->group(function () {
        Route::get('/accounts', [AccountsController::class, 'index'])->name('accounts.index');
    });
    Route::middleware('permission:accounts.create')->group(function () {
        Route::post('/accounts', [AccountsController::class, 'store'])->name('accounts.store');
    });
    Route::middleware('permission:accounts.update')->group(function () {
        Route::put('/accounts/{user}', [AccountsController::class, 'update'])->name('accounts.update');
    });
    Route::middleware('permission:accounts.delete')->group(function () {
        Route::delete('/accounts/{user}', [AccountsController::class, 'destroy'])->name('accounts.destroy');
    });

    // ─── Wilayah helpers ─────────────────────────────────────────────────────
    Route::middleware('role:owner|kasir')->group(function () {
        Route::get('/wilayah/search', [WilayahController::class, 'search'])->name('wilayah.search');
        Route::get('/wilayah/children', [WilayahController::class, 'children'])->name('wilayah.children');
    });

    // ─── Customer Management ─────────────────────────────────────────────────
    Route::middleware('permission:customers.view')->group(function () {
        Route::get('/customers', [CustomersController::class, 'index'])->name('customers.index');
        Route::get('/customers/check-id', [CustomersController::class, 'checkIdNumber'])->name('customers.check-id');
        Route::get('/customers/check-email', [CustomersController::class, 'checkEmail'])->name('customers.check-email');
    });
    Route::middleware('permission:customers.create')->group(function () {
        Route::post('/customers', [CustomersController::class, 'store'])->name('customers.store');
    });
    Route::middleware('permission:customers.update')->group(function () {
        Route::put('/customers/{customer}', [CustomersController::class, 'update'])->name('customers.update');
    });
    Route::middleware('permission:customers.delete')->group(function () {
        Route::delete('/customers/{customer}', [CustomersController::class, 'destroy'])->name('customers.destroy');
    });

    // ─── Rentals Transactions ────────────────────────────────────────────────
    Route::middleware('permission:rentals.view')->group(function () {
        Route::get('/rentals', [RentalsController::class, 'index'])->name('rentals.index');
        Route::get('/rentals/history', [RentalsController::class, 'history'])->name('rentals.history');
    });
    Route::middleware('permission:rentals.create')->group(function () {
        Route::post('/rentals', [RentalsController::class, 'store'])->name('rentals.store');
    });
    Route::middleware('permission:rentals.return')->group(function () {
        Route::post('/rentals/{rental}/return', [RentalsController::class, 'return'])->name('rentals.return');
    });
    Route::middleware('permission:rentals.cancel')->group(function () {
        Route::post('/rentals/{rental}/cancel', [RentalsController::class, 'cancel'])->name('rentals.cancel');
    });
});
