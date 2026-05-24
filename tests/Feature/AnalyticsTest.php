<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Rental;
use App\Models\RentalItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guests are redirected to login.
     */
    public function test_guests_are_redirected_to_login(): void
    {
        $response = $this->get('/analytics');

        $response->assertRedirect('/');
    }

    /**
     * Test that an owner can view the analytics page and get dynamic radar props.
     */
    public function test_authenticated_owner_can_view_analytics_page(): void
    {
        $owner = $this->createOwner();
        $customer = Customer::factory()->create();
        $product = Product::factory()->create([
            'category' => 'Tent',
            'price_per_day' => 15000,
        ]);

        $rental = Rental::create([
            'customer_id' => $customer->id,
            'user_id' => $owner->id,
            'rental_code' => Rental::generateCode(),
            'rental_date' => now(),
            'expected_return_date' => now()->addDays(2),
            'total_price' => 30000,
            'discount' => 0,
            'amount_paid' => 30000,
            'change_returned' => 0,
            'payment_type' => 'cash',
            'status' => 'active',
        ]);

        RentalItem::create([
            'rental_id' => $rental->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'duration_days' => 1,
            'price_per_day' => 15000,
            'subtotal' => 30000,
        ]);

        $response = $this->actingAs($owner)->get('/analytics');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Analytics')
            ->has('radarData')
            ->where('radarData.0.category', 'Tent')
            ->where('radarData.0.rentals', 2)
            ->where('radarData.1.category', 'Backpack')
            ->where('radarData.1.rentals', 0)
            ->has('chartData')
            // Assert we have exactly 91 data points (90 days ago + today)
            ->has('chartData', 91)
            // Verify that today's entry has 30000 for cash (since our rental was today)
            ->where('chartData.90.cash', 30000)
            ->where('chartData.90.qris', 0)
            ->has('pieData')
            // Assert we have exactly 6 months of data
            ->has('pieData', 6)
            // Verify that the current month's entry (index 5) has 1 active rental
            ->where('pieData.5.active', 1)
            ->where('pieData.5.returned', 0)
            ->where('pieData.5.overdue', 0)
            ->where('pieData.5.total', 1)
        );
    }
}
