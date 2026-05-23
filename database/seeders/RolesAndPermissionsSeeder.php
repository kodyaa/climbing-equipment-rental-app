<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Roles:
     *  - owner  : full access (manage products, accounts, customers, and rentals)
     *  - kasir  : operational access only (manage customers & rentals, read-only products)
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ── Permissions ──────────────────────────────────────────────
        $permissions = [
            // Products
            'products.view',
            'products.create',
            'products.update',
            'products.delete',

            // Accounts (user management)
            'accounts.view',
            'accounts.create',
            'accounts.update',
            'accounts.delete',

            // Customers
            'customers.view',
            'customers.create',
            'customers.update',
            'customers.delete',

            // Rentals (kasir operations)
            'rentals.view',
            'rentals.create',
            'rentals.return',
            'rentals.cancel',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name]);
        }

        // ── Roles ─────────────────────────────────────────────────────

        /** Owner: full access to everything */
        $owner = Role::firstOrCreate(['name' => 'owner']);
        $owner->syncPermissions($permissions);

        /** Kasir: can only handle customers and rentals (read-only on products) */
        $kasir = Role::firstOrCreate(['name' => 'kasir']);
        $kasir->syncPermissions([
            'products.view',
            'customers.view',
            'customers.create',
            'customers.update',
            'customers.delete',
            'rentals.view',
            'rentals.create',
            'rentals.return',
            'rentals.cancel',
        ]);
    }
}
