<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StorefrontTest extends TestCase
{
    use RefreshDatabase;

    public function test_categories_endpoint_returns_all_categories(): void
    {
        $this->seed();

        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_products_listing_hides_inactive_and_supports_combined_filters_and_sorting(): void
    {
        $this->seed();
        $gear = Category::where('name', 'Footwear & Gear')->firstOrFail();

        // Inactive product must never appear in storefront listing
        $all = $this->getJson('/api/products');
        $all->assertOk();
        $names = collect($all->json('data'))->pluck('name');
        $this->assertNotContains('ENVY Prototype Knit Trainer', $names);
        $this->assertContains('ENVY Legacy Oversized Tee', $names); // active 0-stock stays visible

        // Combined case-insensitive search + category filter + price_desc sort
        $filtered = $this->getJson("/api/products?q=envy&category_id={$gear->id}&sort=price_desc");
        $filtered->assertOk();

        $prices = collect($filtered->json('data'))->pluck('price')->map(fn ($p) => (float) $p)->all();
        $sorted = $prices;
        rsort($sorted);
        $this->assertSame($sorted, $prices);
        $this->assertCount(4, $prices); // 4 active items in Footwear & Gear (5th is inactive)
    }

    public function test_product_detail_returns_related_active_products_and_blocks_inactive(): void
    {
        $this->seed();

        $active = Product::where('name', 'ENVY Stride Runner V2')->firstOrFail();
        $inactive = Product::where('is_active', false)->firstOrFail();

        $res = $this->getJson("/api/products/{$active->id}");
        $res->assertOk()
            ->assertJsonPath('data.name', 'ENVY Stride Runner V2');

        $related = collect($res->json('related'));
        $this->assertLessThanOrEqual(3, $related->count());
        $this->assertFalse($related->pluck('id')->contains($active->id));
        $this->assertFalse($related->pluck('id')->contains($inactive->id));

        $this->getJson("/api/products/{$inactive->id}")->assertNotFound();
    }
}
