<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AccountsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that guest users are redirected to login.
     */
    public function test_guests_are_redirected_to_login(): void
    {
        $response = $this->get('/accounts');

        $response->assertRedirect('/');
    }

    /**
     * Test that an owner can view the accounts page.
     */
    public function test_authenticated_users_can_view_accounts_page(): void
    {
        $response = $this->actingAs($this->createOwner())->get('/accounts');

        $response->assertStatus(200);
    }

    /**
     * Test that a kasir cannot access the accounts page (403).
     */
    public function test_kasir_cannot_view_accounts_page(): void
    {
        $response = $this->actingAs($this->createKasir())->get('/accounts');

        $response->assertStatus(403);
    }

    /**
     * Test creating a new cashier account with avatar.
     */
    public function test_can_create_account_with_avatar(): void
    {
        Storage::fake('public');
        $owner = $this->createOwner();
        $avatar = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->actingAs($owner)->post('/accounts', [
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
            'phone' => '08123456789',
            'country' => 'id',
            'address' => 'Jakarta, Indonesia',
            'avatar' => $avatar,
            'password' => 'secret123',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
            'phone' => '08123456789',
            'country' => 'id',
            'address' => 'Jakarta, Indonesia',
        ]);

        $createdUser = User::where('email', 'johndoe@example.com')->first();
        $this->assertNotNull($createdUser->avatar);
        $this->assertStringContainsString('/storage/avatars/', $createdUser->avatar);

        // Assert file exists in fake storage
        $storedPath = str_replace('/storage/', '', $createdUser->avatar);
        Storage::disk('public')->assertExists($storedPath);
    }

    /**
     * Test updating a cashier account.
     */
    public function test_can_update_account(): void
    {
        Storage::fake('public');
        $owner = $this->createOwner();
        $targetUser = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'original@example.com',
            'phone' => '123456',
            'country' => 'us',
            'address' => 'Original Address',
        ]);

        $newAvatar = UploadedFile::fake()->image('new-avatar.jpg');

        $response = $this->actingAs($owner)->put("/accounts/{$targetUser->id}", [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'phone' => '654321',
            'country' => 'id',
            'address' => 'Updated Address',
            'avatar' => $newAvatar,
            'password' => 'newsecret123',
        ]);

        $response->assertRedirect();
        $targetUser->refresh();

        $this->assertEquals('Updated Name', $targetUser->name);
        $this->assertEquals('updated@example.com', $targetUser->email);
        $this->assertEquals('654321', $targetUser->phone);
        $this->assertEquals('id', $targetUser->country);
        $this->assertEquals('Updated Address', $targetUser->address);

        $this->assertNotNull($targetUser->avatar);
        $storedPath = str_replace('/storage/', '', $targetUser->avatar);
        Storage::disk('public')->assertExists($storedPath);
    }

    /**
     * Test deleting a cashier account.
     */
    public function test_can_delete_another_account(): void
    {
        $owner = $this->createOwner();
        $targetUser = User::factory()->create();

        $response = $this->actingAs($owner)->delete("/accounts/{$targetUser->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('users', [
            'id' => $targetUser->id,
        ]);
    }

    /**
     * Test that a user cannot delete their own account.
     */
    public function test_cannot_delete_own_account(): void
    {
        $owner = $this->createOwner();

        $response = $this->actingAs($owner)->delete("/accounts/{$owner->id}");

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $owner->id,
        ]);
    }

    /**
     * Test creating a new cashier account with a Dicebear Micah avatar URL.
     */
    public function test_can_create_account_with_dicebear_avatar(): void
    {
        $owner = $this->createOwner();

        $response = $this->actingAs($owner)->post('/accounts', [
            'name' => 'Micah User',
            'email' => 'micah@example.com',
            'phone' => '08123456789',
            'country' => 'id',
            'address' => 'Jakarta, Indonesia',
            'avatar' => 'https://api.dicebear.com/7.x/micah/svg?seed=Micah%20User',
            'password' => 'secret123',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => 'Micah User',
            'email' => 'micah@example.com',
            'avatar' => 'https://api.dicebear.com/7.x/micah/svg?seed=Micah%20User',
        ]);
    }
}
