<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wilayah extends Model
{
    protected $table = 'wilayah';

    protected $primaryKey = 'kode';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = ['kode', 'nama'];

    protected $appends = ['nama_lengkap'];

    /**
     * Get full administrative regional path.
     */
    public function getNamaLengkapAttribute(): string
    {
        $parts = explode('.', $this->kode);
        $codes = [];
        $current = '';
        foreach ($parts as $part) {
            $current = $current ? $current.'.'.$part : $part;
            $codes[] = $current;
        }

        $regions = self::whereIn('kode', $codes)
            ->get()
            ->keyBy('kode');

        $names = [];
        foreach ($codes as $code) {
            if ($regions->has($code)) {
                $names[] = $regions->get($code)->nama;
            }
        }

        return implode(', ', array_reverse($names));
    }
}
