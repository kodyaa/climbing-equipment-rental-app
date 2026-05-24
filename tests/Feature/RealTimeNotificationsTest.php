<?php

namespace Tests\Feature;

use App\Events\OverdueRentalAlert;
use App\Events\RentalStatusChanged;
use App\Events\StockLowAlert;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RealTimeNotificationsTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsKasir(): User
    {
        $user = User::factory()->create();
        $user->assignRole('kasir');

        return $user;
    }

    // ── StockLowAlert ──────────────────────────────────────────────────────────

    #[Test]
    public function it_dispatches_stock_low_alert_when_product_stock_drops_to_five_or_below(): void
    {
        Event::fake([StockLowAlert::class, RentalStatusChanged::class]);

        $user = $this->actingAsKasir();
        $customer = Customer::factory()->create();
        $product = Product::factory()->create(['stock' => 6, 'price_per_day' => 50_000, 'status' => 'available']);

        $this->actingAs($user)->post('/rentals', [
            'customer_id' => $customer->id,
            'rental_date' => today()->toDateString(),
            'expected_return_date' => today()->addDays(3)->toDateString(),
            'payment_type' => 'cash',
            'amount_paid' => 150_000,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'duration_days' => 3],
            ],
        ]);

        // Stock goes from 6 → 5, which is exactly at threshold
        Event::assertDispatched(StockLowAlert::class, function ($event) use ($product) {
            return $event->product['id'] === $product->id
                && $event->product['stock'] === 5;
        });
    }

    #[Test]
    public function it_does_not_dispatch_stock_low_alert_when_stock_remains_above_five(): void
    {
        Event::fake([StockLowAlert::class, RentalStatusChanged::class]);

        $user = $this->actingAsKasir();
        $customer = Customer::factory()->create();
        $product = Product::factory()->create(['stock' => 10, 'price_per_day' => 50_000, 'status' => 'available']);

        $this->actingAs($user)->post('/rentals', [
            'customer_id' => $customer->id,
            'rental_date' => today()->toDateString(),
            'expected_return_date' => today()->addDays(1)->toDateString(),
            'payment_type' => 'cash',
            'amount_paid' => 50_000,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'duration_days' => 1],
            ],
        ]);

        // Stock goes 10 → 9, no alert expected
        Event::assertNotDispatched(StockLowAlert::class);
    }

    // ── RentalStatusChanged ────────────────────────────────────────────────────

    #[Test]
    public function it_dispatches_rental_status_changed_when_rental_is_created(): void
    {
        Event::fake([StockLowAlert::class, RentalStatusChanged::class]);

        $user = $this->actingAsKasir();
        $customer = Customer::factory()->create();
        $product = Product::factory()->create(['stock' => 10, 'price_per_day' => 50_000, 'status' => 'available']);

        $this->actingAs($user)->post('/rentals', [
            'customer_id' => $customer->id,
            'rental_date' => today()->toDateString(),
            'expected_return_date' => today()->addDays(1)->toDateString(),
            'payment_type' => 'cash',
            'amount_paid' => 50_000,
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1, 'duration_days' => 1],
            ],
        ]);

        Event::assertDispatched(RentalStatusChanged::class, function ($event) {
            return $event->action === 'created' && $event->status === 'active';
        });
    }

    #[Test]
    public function it_dispatches_rental_status_changed_when_rental_is_returned(): void
    {
        Event::fake([RentalStatusChanged::class]);

        $user = $this->actingAsKasir();
        $rental = Rental::factory()->for(Customer::factory())->for($user, 'cashier')->create(['status' => 'active']);

        $this->actingAs($user)->post("/rentals/{$rental->id}/return");

        Event::assertDispatched(RentalStatusChanged::class, function ($event) {
            return $event->action === 'returned' && $event->status === 'returned';
        });
    }

    #[Test]
    public function it_dispatches_rental_status_changed_when_rental_is_cancelled(): void
    {
        Event::fake([RentalStatusChanged::class]);

        $user = $this->actingAsKasir();
        $rental = Rental::factory()->for(Customer::factory())->for($user, 'cashier')->create(['status' => 'active']);

        $this->actingAs($user)->post("/rentals/{$rental->id}/cancel");

        Event::assertDispatched(RentalStatusChanged::class, function ($event) {
            return $event->action === 'cancelled' && $event->status === 'cancelled';
        });
    }

    // ── BroadcastOverdueRentals Command ───────────────────────────────────────

    #[Test]
    public function overdue_command_dispatches_alert_when_overdue_rentals_exist(): void
    {
        Event::fake([OverdueRentalAlert::class]);

        $customer = Customer::factory()->create();
        $user = $this->actingAsKasir();

        Rental::factory()->for($customer)->for($user, 'cashier')->create([
            'status' => 'active',
            'expected_return_date' => today()->subDays(2),
        ]);

        $this->artisan('rentals:broadcast-overdue')->assertSuccessful();

        Event::assertDispatched(OverdueRentalAlert::class, function ($event) {
            return $event->overdueCount === 1
                && count($event->rentals) === 1
                && $event->rentals[0]['days_overdue'] === 2;
        });
    }

    #[Test]
    public function overdue_command_does_not_dispatch_alert_when_no_overdue_rentals(): void
    {
        Event::fake([OverdueRentalAlert::class]);

        $this->artisan('rentals:broadcast-overdue')->assertSuccessful();

        Event::assertNotDispatched(OverdueRentalAlert::class);
    }
}
