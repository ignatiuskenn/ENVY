<?php

namespace Tests\Feature;

use App\Enums\PaymentMethod;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    private function actAsAdmin(): void
    {
        $this->seed();
        Sanctum::actingAs(User::where('email', 'admin@envy-demo.test')->firstOrFail());
    }

    public function test_admin_can_list_filter_create_and_update_products(): void
    {
        $this->actAsAdmin();
        $tops = Category::where('name', 'Gorpcore Jackets')->firstOrFail();

        // Includes inactive products
        $all = $this->getJson('/api/admin/products');
        $all->assertOk()->assertJsonCount(12, 'data');

        $inactiveOnly = $this->getJson('/api/admin/products?status=inactive');
        $inactiveOnly->assertOk()->assertJsonCount(1, 'data');

        $created = $this->postJson('/api/admin/products', [
            'category_id' => $tops->id,
            'name' => 'ENVY Sprint Singlet',
            'description' => 'Ultralight race singlet.',
            'price' => 650.00,
            'stock_quantity' => 18,
            'image_url' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
            'is_active' => true,
        ]);
        $created->assertCreated()->assertJsonPath('data.name', 'ENVY Sprint Singlet');

        $id = $created->json('data.id');
        $this->putJson("/api/admin/products/{$id}", [
            'category_id' => $tops->id,
            'name' => 'ENVY Sprint Singlet V2',
            'description' => 'Updated race singlet.',
            'price' => 700.00,
            'stock_quantity' => 12,
            'is_active' => false,
        ])->assertOk()->assertJsonPath('data.is_active', false);
    }

    public function test_admin_cannot_hard_delete_product_referenced_by_an_order(): void
    {
        $this->actAsAdmin();
        $socks = Product::where('name', 'ENVY Acid-Wash Boxy Tee')->firstOrFail();

        $this->postJson('/api/checkout', [
            'customer_name' => 'Test Buyer',
            'customer_email' => 'buyer@example.com',
            'customer_contact' => '09171234567',
            'delivery_address' => 'Taguig',
            'payment_method' => PaymentMethod::CashOnDelivery->value,
            'items' => [['product_id' => $socks->id, 'quantity' => 1, 'expected_unit_price' => 120.00]],
        ])->assertCreated();

        $this->deleteJson("/api/admin/products/{$socks->id}")
            ->assertStatus(409)
            ->assertJsonPath('can_deactivate', true);

        $this->assertDatabaseHas('products', ['id' => $socks->id]);
    }

    public function test_admin_category_crud_enforces_case_insensitive_uniqueness_and_blocks_assigned_delete(): void
    {
        $this->actAsAdmin();
        $tops = Category::where('name', 'Gorpcore Jackets')->firstOrFail();

        // Case-insensitive duplicate rejected
        $this->postJson('/api/admin/categories', ['name' => 'gorpcore jackets'])
            ->assertStatus(422);

        // Delete blocked when products exist
        $this->deleteJson("/api/admin/categories/{$tops->id}")
            ->assertStatus(409);

        // New empty category can be created, renamed, and deleted
        $cat = $this->postJson('/api/admin/categories', ['name' => 'Accessories'])
            ->assertCreated();
        $catId = $cat->json('data.id');

        $this->putJson("/api/admin/categories/{$catId}", ['name' => 'Training Accessories'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Training Accessories');

        $this->deleteJson("/api/admin/categories/{$catId}")->assertOk();
    }

    public function test_admin_can_upload_product_image_file(): void
    {
        Storage::fake('public');
        $this->actAsAdmin();

        $res = $this->post('/api/admin/products/image', [
            'image' => UploadedFile::fake()->create('jacket.png', 64, 'image/png'),
        ], ['Accept' => 'application/json']);

        $res->assertCreated();
        $url = $res->json('url');
        $this->assertNotEmpty($url);

        $path = parse_url($url, PHP_URL_PATH);
        $this->get($path)->assertOk();
    }
}
