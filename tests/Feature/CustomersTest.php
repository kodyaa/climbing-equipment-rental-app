<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Wilayah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomersTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guest users are redirected to login.
     */
    public function test_guests_are_redirected_to_login(): void
    {
        $response = $this->get('/customers');

        $response->assertRedirect('/');
    }

    /**
     * Test that an owner can view the customers page.
     */
    public function test_authenticated_users_can_view_customers_page(): void
    {
        $response = $this->actingAs($this->createOwner())->get('/customers');

        $response->assertStatus(200);
    }

    /**
     * Test that a kasir can view the customers page.
     */
    public function test_kasir_can_view_customers_page(): void
    {
        $response = $this->actingAs($this->createKasir())->get('/customers');

        $response->assertStatus(200);
    }

    /**
     * Test creating a new customer with wilayah_kode.
     */
    public function test_can_create_customer(): void
    {
        $owner = $this->createOwner();
        Wilayah::create([
            'kode' => '12.34.56.7890',
            'nama' => 'Test Region',
        ]);

        $response = $this->actingAs($owner)->post('/customers', [
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'id_number' => '3273010101010001',
            'email' => 'budi@example.com',
            'wilayah_kode' => '12.34.56.7890',
            'address' => 'Jl. Kebon Jeruk No. 12',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('customers', [
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'id_number' => '3273010101010001',
            'email' => 'budi@example.com',
            'wilayah_kode' => '12.34.56.7890',
            'address' => 'Jl. Kebon Jeruk No. 12',
        ]);
    }

    /**
     * Test updating a customer.
     */
    public function test_can_update_customer(): void
    {
        $owner = $this->createOwner();
        $customer = Customer::factory()->create([
            'name' => 'Original Name',
        ]);

        Wilayah::create([
            'kode' => '99.88.77.6666',
            'nama' => 'New Region',
        ]);

        $response = $this->actingAs($owner)->put("/customers/{$customer->id}", [
            'name' => 'Updated Name',
            'phone' => '0899999999',
            'id_number' => '999999999999',
            'email' => 'updated@example.com',
            'wilayah_kode' => '99.88.77.6666',
            'address' => 'New Address',
        ]);

        $response->assertRedirect();
        $customer->refresh();

        $this->assertEquals('Updated Name', $customer->name);
        $this->assertEquals('0899999999', $customer->phone);
        $this->assertEquals('99.88.77.6666', $customer->wilayah_kode);
        $this->assertEquals('New Address', $customer->address);
    }

    /**
     * Test deleting a customer.
     */
    public function test_can_delete_customer(): void
    {
        $owner = $this->createOwner();
        $customer = Customer::factory()->create();

        $response = $this->actingAs($owner)->delete("/customers/{$customer->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('customers', [
            'id' => $customer->id,
        ]);
    }

    /**
     * Test searching for wilayah.
     */
    public function test_can_search_wilayah(): void
    {
        $owner = $this->createOwner();
        Wilayah::create([
            'kode' => '11.22.33.4444',
            'nama' => 'Bandung, Jawa Barat',
        ]);

        $response = $this->actingAs($owner)->get('/wilayah/search?search=Bandung');

        $response->assertStatus(200);
        $response->assertJsonFragment([
            'kode' => '11.22.33.4444',
            'nama' => 'Bandung, Jawa Barat',
        ]);
    }
}
