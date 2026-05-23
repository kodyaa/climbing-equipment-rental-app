<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->comment('Kasir yang melayani');
            $table->string('rental_code')->unique()->comment('Nomor transaksi, e.g. TRX-20240524-001');
            $table->date('rental_date')->comment('Tanggal mulai sewa');
            $table->date('expected_return_date')->comment('Tanggal kembali sesuai perjanjian');
            $table->dateTime('returned_at')->nullable()->comment('Tanggal & jam barang dikembalikan');
            $table->decimal('total_price', 12, 2)->default(0);
            $table->string('status')->default('active')
                ->comment('active | returned | overdue | cancelled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
