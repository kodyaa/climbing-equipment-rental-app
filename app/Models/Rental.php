<?php

namespace App\Models;

use Database\Factories\RentalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'customer_id',
    'user_id',
    'rental_code',
    'rental_date',
    'expected_return_date',
    'returned_at',
    'total_price',
    'discount',
    'amount_paid',
    'change_returned',
    'payment_type',
    'status',
    'notes',
])]
class Rental extends Model
{
    /** @use HasFactory<RentalFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rental_date' => 'date',
            'expected_return_date' => 'date',
            'returned_at' => 'datetime',
            'total_price' => 'decimal:2',
            'discount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'change_returned' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Customer, $this>
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Kasir yang memproses transaksi.
     *
     * @return BelongsTo<User, $this>
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return HasMany<RentalItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(RentalItem::class);
    }

    /**
     * Generate a unique rental code in the format TRX-YYYYMMDD-XXXX.
     */
    public static function generateCode(): string
    {
        $date = now()->format('Ymd');
        $last = static::whereDate('created_at', today())->count() + 1;

        return sprintf('TRX-%s-%04d', $date, $last);
    }
}
