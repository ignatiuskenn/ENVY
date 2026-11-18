<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->active()
            ->with('category:id,name');

        if ($search = trim((string) $request->query('q', ''))) {
            $needle = mb_strtolower($search);
            $query->whereRaw('LOWER(name) LIKE ?', ["%{$needle}%"]);
        }

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', (int) $categoryId);
        }

        match ($request->query('sort')) {
            'price_asc' => $query->orderBy('price', 'asc')->orderBy('id', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc')->orderBy('id', 'asc'),
            default => $query->orderBy('id', 'asc'),
        };

        return response()->json(['data' => $query->get()]);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::query()
            ->active()
            ->with('category:id,name')
            ->findOrFail($id);

        $related = Product::query()
            ->active()
            ->with('category:id,name')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->orderBy('id', 'asc')
            ->limit(3)
            ->get();

        return response()->json([
            'data' => $product,
            'related' => $related,
        ]);
    }
}
