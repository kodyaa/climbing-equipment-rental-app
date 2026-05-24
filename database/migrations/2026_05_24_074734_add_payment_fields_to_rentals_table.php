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
        Schema::table('rentals', function (Blueprint $table) {
            $table->decimal('discount', 12, 2)->default(0)->after('total_price');
            $table->decimal('amount_paid', 12, 2)->default(0)->after('discount');
            $table->decimal('change_returned', 12, 2)->default(0)->after('amount_paid');
            $table->string('payment_type')->default('cash')->after('change_returned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            $table->dropColumn(['discount', 'amount_paid', 'change_returned', 'payment_type']);
        });
    }
};
