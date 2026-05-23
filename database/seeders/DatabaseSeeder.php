<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Roles & permissions must be seeded before users get assigned roles
        $this->call(RolesAndPermissionsSeeder::class);

        $admin = User::factory()->create([
            'name' => 'Kodya Admin',
            'email' => 'admin@kodya.id',
            'password' => Hash::make('password'),
            'phone' => '+62 812-3456-7890',
            'country' => 'id',
            'address' => 'Gedung Kodya, Jakarta, Indonesia',
        ]);
        $admin->assignRole('owner');

        $cashier = User::factory()->create([
            'name' => 'Kodya Cashier',
            'email' => 'cashier@kodya.id',
            'password' => Hash::make('password'),
            'phone' => '+62 898-7654-3210',
            'country' => 'id',
            'address' => 'Jl. Jenderal Sudirman No. 12, Jakarta, Indonesia',
        ]);
        $cashier->assignRole('kasir');

        $this->call([
            ProductSeeder::class,
        ]);
    }
}
