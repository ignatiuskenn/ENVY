<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminOrderTest extends TestCase
{
    use RefreshDatabase;

    private function actAsAdmin(): void
    {
        $this->seed();
        Sanctum::actingAs(User::where('email', 'admin@envy-demo.test')->firstOrFail());
    }

    public function test_overview_kpis_and_customer_summary_match_completed_orders_and_normalized_emails(): void
    {
        $this->actAsAdmin();
        $socks = Product::where('name', 'ENVY Acid-Wash Boxy Tee')->firstOrFail(); // 120.00

        // Order 1: Completed (counts toward Total Sales)
        $o1 = $this->postJson('/api/checkout', [
            'customer_name' => 'Maria Clara',
            'customer_email' => 'Maria@Example.com',
            'customer_contact' => '09170001111',
            'delivery_address' => 'Manila',
            'payment_method' => PaymentMethod::EWallet->value,
            'items' => [['product_id' => $socks->id, 'quantity' => 2, 'expected_unit_price' => 120.00]],
        ])->assertCreated()->json('data.id');

        // Advance Order 1 to Completed
        foreach ([OrderStatus::Confirmed, OrderStatus::Preparing, OrderStatus::Shipped, OrderStatus::Completed] as $status) {
            $this->patchJson("/api/admin/orders/{$o1}/status", ['status' => $status->value])->assertOk();
        }

        // Order 2: Same normalized email, newer name/contact, left Pending (excluded from Total Sales)
        $this->postJson('/api/checkout', [
            'customer_name' => 'Maria C. Santos',
            'customer_email' => '  maria@example.com ',
            'customer_contact' => '09179998888',
            'delivery_address' => 'Manila',
            'payment_method' => PaymentMethod::CashOnDelivery->value,
            'items' => [['product_id' => $socks->id, 'quantity' => 1, 'expected_unit_price' => 120.00]],
        ])->assertCreated();

        $overview = $this->getJson('/api/admin/overview')->assertOk();
        $overview->assertJsonPath('data.total_products', 12)
            ->assertJsonPath('data.total_orders', 2)
            ->assertJsonPath('data.pending_orders', 1)
            ->assertJsonPath('data.completed_orders', 1)
            ->assertJsonPath('data.total_customers', 1)
            ->assertJsonPath('data.total_sales', '240.00');

        $customers = $this->getJson('/api/admin/customers')->assertOk();
        $customers->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'maria@example.com')
            ->assertJsonPath('data.0.name', 'Maria C. Santos')
            ->assertJsonPath('data.0.contact', '09179998888')
            ->assertJsonPath('data.0.order_count', 2)
            ->assertJsonPath('data.0.completed_total', '240.00');
    }

    public function test_order_state_machine_restores_stock_once_on_cancel_and_preserves_snapshots(): void
    {
        $this->actAsAdmin();
        $socks = Product::where('name', 'ENVY Acid-Wash Boxy Tee')->firstOrFail(); // stock 40

        $orderRes = $this->postJson('/api/checkout', [
            'customer_name' => 'Jose Rizal',
            'customer_email' => 'jose@example.com',
            'customer_contact' => '09171112222',
            'delivery_address' => 'Calamba',
            'payment_method' => PaymentMethod::BankTransfer->value,
            'items' => [['product_id' => $socks->id, 'quantity' => 3, 'expected_unit_price' => 120.00]],
        ])->assertCreated();

        $orderId = $orderRes->json('data.id');
        $this->assertSame(37, $socks->fresh()->stock_quantity);

        // Invalid skip Pending -> Preparing fails
        $this->patchJson("/api/admin/orders/{$orderId}/status", ['status' => OrderStatus::Preparing->value])
            ->assertStatus(422);

        // Valid Pending -> Confirmed
        $this->patchJson("/api/admin/orders/{$orderId}/status", ['status' => OrderStatus::Confirmed->value])
            ->assertOk();

        // Cancel from Confirmed restores stock once
        $this->patchJson("/api/admin/orders/{$orderId}/status", ['status' => OrderStatus::Cancelled->value])
            ->assertOk()
            ->assertJsonPath('data.stock_restored', true);
        $this->assertSame(40, $socks->fresh()->stock_quantity);

        // Repeated cancellation rejected and stock stays 40
        $this->patchJson("/api/admin/orders/{$orderId}/status", ['status' => OrderStatus::Cancelled->value])
            ->assertStatus(422);
        $this->assertSame(40, $socks->fresh()->stock_quantity);

        // Edit product name & price; existing order snapshot must remain unchanged
        $this->putJson("/api/admin/products/{$socks->id}", [
            'category_id' => $socks->category_id,
            'name' => 'ENVY Acid-Wash Boxy Tee RENAMED',
            'description' => $socks->description,
            'price' => 999.00,
            'stock_quantity' => 40,
            'is_active' => true,
        ])->assertOk();

        $detail = $this->getJson("/api/admin/orders/{$orderId}")->assertOk();
        $detail->assertJsonPath('data.items.0.product_name_snapshot', 'ENVY Acid-Wash Boxy Tee')
            ->assertJsonPath('data.items.0.unit_price_snapshot', '120.00')
            ->assertJsonPath('data.total', '360.00');
    }
}
