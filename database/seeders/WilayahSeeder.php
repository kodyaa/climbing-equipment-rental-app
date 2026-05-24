<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WilayahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $path = database_path('seeders/wilayah.sql');

        if (file_exists($path)) {
            $this->command->info('Importing wilayah.sql to database...');
            $sql = file_get_contents($path);

            // Strip table structure statements to respect the Laravel migration
            $sql = preg_replace('/DROP TABLE IF EXISTS[^;]+;/i', '', $sql);
            $sql = preg_replace('/CREATE TABLE (IF NOT EXISTS )?`?wilayah`?[^;]+;/is', '', $sql);
            $sql = preg_replace('/CREATE INDEX[^;]+;/i', '', $sql);

            DB::unprepared($sql);
            $this->command->info('Import wilayah.sql completed!');
        } else {
            $this->command->error("File {$path} not found!");
        }
    }
}
