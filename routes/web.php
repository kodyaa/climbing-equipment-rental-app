<?php

use App\Http\Controllers\AccountsController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ProductsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy']);

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    });

    Route::get('/accounts', [AccountsController::class, 'index'])->name('accounts.index');
    Route::post('/accounts', [AccountsController::class, 'store'])->name('accounts.store');
    Route::post('/accounts/{user}', [AccountsController::class, 'update'])->name('accounts.update');
    Route::delete('/accounts/{user}', [AccountsController::class, 'destroy'])->name('accounts.destroy');

    Route::get('/products', [ProductsController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductsController::class, 'store'])->name('products.store');
    Route::post('/products/{product}', [ProductsController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductsController::class, 'destroy'])->name('products.destroy');
});
