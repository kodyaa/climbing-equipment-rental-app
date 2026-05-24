<?php

namespace App\Http\Controllers;

use App\Models\Wilayah;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WilayahController extends Controller
{
    /**
     * Search regional administrative areas.
     */
    public function search(Request $request): JsonResponse
    {
        $search = $request->query('search');
        if (strlen($search) < 2) {
            return response()->json([]);
        }

        $results = Wilayah::query()
            ->where('nama', 'like', "%{$search}%")
            ->orWhere('kode', 'like', "{$search}%")
            ->limit(20)
            ->get();

        return response()->json($results);
    }

    /**
     * Get child administrative areas for a given parent code.
     */
    public function children(Request $request): JsonResponse
    {
        $parent = $request->query('parent');

        if (! $parent) {
            $data = Wilayah::query()
                ->whereRaw('LENGTH(kode) = 2')
                ->orderBy('nama')
                ->get();
        } else {
            $len = strlen($parent);
            if ($len === 2) {
                $data = Wilayah::query()
                    ->whereRaw('LENGTH(kode) = 5')
                    ->where('kode', 'like', "{$parent}.%")
                    ->orderBy('nama')
                    ->get();
            } elseif ($len === 5) {
                $data = Wilayah::query()
                    ->whereRaw('LENGTH(kode) = 8')
                    ->where('kode', 'like', "{$parent}.%")
                    ->orderBy('nama')
                    ->get();
            } elseif ($len === 8) {
                $data = Wilayah::query()
                    ->whereRaw('LENGTH(kode) = 13')
                    ->where('kode', 'like', "{$parent}.%")
                    ->orderBy('nama')
                    ->get();
            } else {
                $data = [];
            }
        }

        return response()->json($data);
    }
}
