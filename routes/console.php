<?php

use App\Console\Commands\BroadcastOverdueRentals;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Broadcast overdue rental alerts to all active staff every hour
Schedule::command(BroadcastOverdueRentals::class)->hourly();
