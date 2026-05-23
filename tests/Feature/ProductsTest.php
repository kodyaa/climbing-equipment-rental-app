<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guest users are redirected to login.
     */
    public function test_guests_are_redirected_to_login(): void
    {
        $response = $this->get('/products');

        $response->assertRedirect('/');
    }

    /**
     * Test that an owner can view the products page.
     */
    public function test_authenticated_users_can_view_products_page(): void
    {
        $response = $this->actingAs($this->createOwner())->get('/products');

        $response->assertStatus(200);
    }

    /**
     * Test that a kasir cannot manage products (create/update/delete restricted to owner).
     */
    public function test_kasir_cannot_create_product(): void
    {
        $kasir = $this->createKasir();

        $response = $this->actingAs($kasir)->post('/products', [
            'name' => 'Unauthorized Product',
            'category' => 'Tent',
            'price_per_day' => 10000,
            'stock' => 1,
            'status' => 'available',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test creating a new product with image upload.
     */
    public function test_can_create_product_with_image_upload(): void
    {
        Storage::fake('public');
        $owner = $this->createOwner();
        $image = UploadedFile::fake()->image('backpack.jpg');

        $response = $this->actingAs($owner)->post('/products', [
            'name' => 'Eiger Carrier 60L',
            'category' => 'Backpack',
            'description' => 'Comfortable backpack for long trekking.',
            'price_per_day' => 45000.00,
            'stock' => 5,
            'status' => 'available',
            'image' => $image,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('products', [
            'name' => 'Eiger Carrier 60L',
            'category' => 'Backpack',
            'price_per_day' => 45000.00,
            'stock' => 5,
            'status' => 'available',
        ]);

        $createdProduct = Product::where('name', 'Eiger Carrier 60L')->first();
        $this->assertNotNull($createdProduct->image);
        $this->assertStringContainsString('/storage/products/', $createdProduct->image);

        // Assert file exists in fake storage
        $storedPath = str_replace('/storage/', '', $createdProduct->image);
        Storage::disk('public')->assertExists($storedPath);
    }

    /**
     * Test creating a new product with an external image URL.
     */
    public function test_can_create_product_with_external_image_url(): void
    {
        $owner = $this->createOwner();

        $response = $this->actingAs($owner)->post('/products', [
            'name' => 'Consina Magnum 4',
            'category' => 'Tent',
            'description' => 'A nice 4 person tent.',
            'price_per_day' => 50000.00,
            'stock' => 4,
            'status' => 'available',
            'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('products', [
            'name' => 'Consina Magnum 4',
            'category' => 'Tent',
            'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
        ]);
    }

    /**
     * Test updating a product.
     */
    public function test_can_update_product(): void
    {
        Storage::fake('public');
        $owner = $this->createOwner();
        $product = Product::factory()->create([
            'name' => 'Original Name',
            'category' => 'Tent',
            'description' => 'Original description',
            'price_per_day' => 10000.00,
            'stock' => 2,
            'status' => 'available',
        ]);

        $newImage = UploadedFile::fake()->image('updated.jpg');

        $response = $this->actingAs($owner)->put("/products/{$product->id}", [
            'name' => 'Updated Name',
            'category' => 'Backpack',
            'description' => 'Updated description',
            'price_per_day' => 20000.00,
            'stock' => 4,
            'status' => 'maintenance',
            'image' => $newImage,
        ]);

        $response->assertRedirect();
        $product->refresh();

        $this->assertEquals('Updated Name', $product->name);
        $this->assertEquals('Backpack', $product->category);
        $this->assertEquals('Updated description', $product->description);
        $this->assertEquals(20000.00, $product->price_per_day);
        $this->assertEquals(4, $product->stock);
        $this->assertEquals('maintenance', $product->status);

        $this->assertNotNull($product->image);
        $storedPath = str_replace('/storage/', '', $product->image);
        Storage::disk('public')->assertExists($storedPath);
    }

    /**
     * Test deleting a product.
     */
    public function test_can_delete_product(): void
    {
        $owner = $this->createOwner();
        $product = Product::factory()->create();

        $response = $this->actingAs($owner)->delete("/products/{$product->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
        ]);
    }
}
