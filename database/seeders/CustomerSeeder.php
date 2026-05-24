<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Wilayah;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Fetch some regions to assign
        $regions = Wilayah::query()->whereRaw('LENGTH(kode) = 13')->limit(10)->pluck('kode')->toArray();

        $indonesianCustomers = [
            [
                'name' => 'Budi Santoso',
                'phone' => '081234567890',
                'id_number' => '3273012345670001',
                'identity_photo' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
                'email' => 'budi.santoso@gmail.com',
                'wilayah_kode' => ! empty($regions) ? $regions[array_rand($regions)] : null,
                'address' => 'Jl. Merdeka No. 10, Kel. Braga, Kec. Sumur Bandung',
            ],
            [
                'name' => 'Siti Aminah',
                'phone' => '081398765432',
                'id_number' => '3171019876540002',
                'identity_photo' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500',
                'email' => 'siti.aminah@yahoo.com',
                'wilayah_kode' => ! empty($regions) ? $regions[array_rand($regions)] : null,
                'address' => 'Jl. Sudirman Kav. 21, Kel. Karet, Kec. Setiabudi',
            ],
            [
                'name' => 'Aditya Wijaya',
                'phone' => '085711223344',
                'id_number' => '3578011122330003',
                'identity_photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
                'email' => 'aditya.wijaya@outlook.com',
                'wilayah_kode' => ! empty($regions) ? $regions[array_rand($regions)] : null,
                'address' => 'Jl. Diponegoro No. 45, Kel. Darmo, Kec. Wonokromo',
            ],
            [
                'name' => 'Dewi Lestari',
                'phone' => '089655443322',
                'id_number' => '3471015544330004',
                'identity_photo' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
                'email' => 'dewi.lestari@gmail.com',
                'wilayah_kode' => ! empty($regions) ? $regions[array_rand($regions)] : null,
                'address' => 'Jl. Malioboro No. 12, Kel. Sosromenduran, Kec. Gedongtengen',
            ],
            [
                'name' => 'Fajar Pratama',
                'phone' => '081299887766',
                'id_number' => '5171019988770005',
                'identity_photo' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
                'email' => 'fajar.pratama@hotmail.com',
                'wilayah_kode' => ! empty($regions) ? $regions[array_rand($regions)] : null,
                'address' => 'Jl. Gajah Mada No. 88, Kel. Pemecutan, Kec. Denpasar Barat',
            ],
        ];

        foreach ($indonesianCustomers as $customerData) {
            Customer::updateOrCreate(
                ['id_number' => $customerData['id_number']],
                $customerData
            );
        }

        // Create 15 more random customers using the factory
        Customer::factory()->count(15)->create();
    }
}
