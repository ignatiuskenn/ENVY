<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()
            ->with('category:id,name')
            ->withExists('orderItems as is_referenced_in_orders')
            ->search($request->query('q'));

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', (int) $categoryId);
        }

        match ($request->query('status')) {
            'active' => $query->where('is_active', true),
            'inactive' => $query->where('is_active', false),
            'out_of_stock' => $query->where('is_active', true)->where('stock_quantity', 0),
            default => null,
        };

        return response()->json([
            'data' => $query->orderByDesc('id')->get(),
        ]);
    }

    public function store(SaveProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name']);

        $product = Product::create($data)->load('category:id,name');

        return response()->json(['data' => $product], 201);
    }

    public function update(SaveProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();
        if ($data['name'] !== $product->name) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        $product->update($data);

        return response()->json(['data' => $product->fresh(['category:id,name'])]);
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->orderItems()->exists()) {
            return response()->json([
                'message' => 'Cannot delete this product because it is referenced by existing orders. Mark it inactive instead to preserve order history.',
                'can_deactivate' => true,
            ], 409);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $suffix = 2;

        while (
            Product::query()
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }
}
