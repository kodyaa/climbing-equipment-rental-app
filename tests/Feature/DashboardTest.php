<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Rental;
use App\Models\RentalItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guests are redirected to login.
     */
    public function test_guests_are_redirected_to_login(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/');
    }

    /**
     * Test that an owner can view the dashboard page.
     */
    public function test_authenticated_owner_can_view_dashboard_page(): void
    {
        $owner = $this->createOwner();

        $response = $this->actingAs($owner)->get('/dashboard');

        $response->assertStatus(200);
    }

    /**
     * Test that the dashboard contains correct aggregated stats and rentals.
     */
    public function test_dashboard_returns_correct_calculated_inertia_props(): void
    {
        $owner = $this->createOwner();

        $customer = Customer::factory()->create([
            'name' => 'Budi Santoso',
            'created_at' => now(),
        ]);

        $product = Product::factory()->create([
            'name' => 'Tenda Dome',
            'price_per_day' => 20000,
        ]);

        $rental = Rental::create([
            'customer_id' => $customer->id,
            'user_id' => $owner->id,
            'rental_code' => Rental::generateCode(),
            'rental_date' => now(),
            'expected_return_date' => now()->addDays(2),
            'total_price' => 40000,
            'discount' => 0,
            'amount_paid' => 40000,
            'change_returned' => 0,
            'payment_type' => 'cash',
            'status' => 'active',
        ]);

        RentalItem::create([
            'rental_id' => $rental->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'duration_days' => 1,
            'price_per_day' => 20000,
            'subtotal' => 40000,
        ]);

        $response = $this->actingAs($owner)->get('/dashboard');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('stats')
            ->has('chartData')
            ->where('stats.total_revenue.value', 40000)
            ->where('stats.total_customers.value', 1)
            ->where('stats.active_rentals.value', 1)
            ->where('stats.items_rented.value', 2)
        );

    }
}
