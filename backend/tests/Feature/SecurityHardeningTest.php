<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_image_url_rejects_non_http_schemes(): void
    {
        $this->seed();
        Sanctum::actingAs(User::where('email', 'admin@envy-demo.test')->firstOrFail());
        $tops = Category::where('name', 'Tops & Outerwear')->firstOrFail();

        $this->postJson('/api/admin/products', [
            'category_id' => $tops->id,
            'name' => 'ENVY Unsafe URL Test',
            'price' => 500.00,
            'stock_quantity' => 5,
            'image_url' => 'javascript:alert(1)',
            'is_active' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors(['image_url']);
    }

    public function test_search_escapes_sql_like_wildcards(): void
    {
        $this->seed();

        $this->getJson('/api/products?q=%25')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_auth_endpoints_enforce_rate_limiting(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/admin/login', [
                'email' => 'admin@envy-demo.test',
                'password' => 'wrong',
            ])->assertStatus(422);
        }

        $this->postJson('/api/admin/login', [
            'email' => 'admin@envy-demo.test',
            'password' => 'wrong',
        ])->assertStatus(429);
    }

    public function test_sanctum_token_expiration_is_configured(): void
    {
        $expiration = config('sanctum.expiration');
        $this->assertIsInt($expiration);
        $this->assertGreaterThan(0, $expiration);
    }
}
