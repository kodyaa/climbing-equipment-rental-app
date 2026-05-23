<?php

namespace Tests;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Seed roles & permissions before each test that uses RefreshDatabase.
     * Called automatically after the database is refreshed.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    /**
     * Create and return a User with the 'owner' role.
     */
    protected function createOwner(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole('owner');

        return $user;
    }

    /**
     * Create and return a User with the 'kasir' role.
     */
    protected function createKasir(array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole('kasir');

        return $user;
    }
}
