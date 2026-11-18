<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function actAsCustomer(): void
    {
        $this->seed();
        Sanctum::actingAs(User::where('email', 'customer@envy-demo.test')->firstOrFail());
    }

    public function test_checkout_validates_required_fields_and_blocks_whitespace_name(): void
    {
        $this->actAsCustomer();
        $socks = Product::where('name', 'ENVY Crew Socks')->firstOrFail();

        $response = $this->postJson('/api/checkout', [
            'customer_name' => '   ',
            'customer_email' => 'not-an-email',
            'customer_contact' => '',
            'delivery_address' => '',
            'payment_method' => 'Bitcoin',
            'items' => [
                ['product_id' => $socks->id, 'quantity' => 1, 'expected_unit_price' => 120.00],
            ],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors([
                'customer_name',
                'customer_email',
                'customer_contact',
                'delivery_address',
                'payment_method',
            ]);
    }

    public function test_checkout_detects_price_or_availability_changes_and_returns_conflict(): void
    {
        $this->actAsCustomer();
        $socks = Product::where('name', 'ENVY Crew Socks')->firstOrFail();

        $response = $this->postJson('/api/checkout', [
            'customer_name' => 'Alex Rivera',
            'customer_email' => 'Alex@Example.com',
            'customer_contact' => '+63 917 123 4567',
            'delivery_address' => '123 BGC High Street, Taguig',
            'payment_method' => PaymentMethod::CashOnDelivery->value,
            'items' => [
                ['product_id' => $socks->id, 'quantity' => 1, 'expected_unit_price' => 99.00],
            ],
        ]);

        $response->assertStatus(409)
            ->assertJsonStructure(['message', 'changes']);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_blocks_out_of_stock_and_inactive_products(): void
    {
        $this->actAsCustomer();
        $oos = Product::where('stock_quantity', 0)->firstOrFail();
        $inactive = Product::where('is_active', false)->firstOrFail();

        $payload = [
            'customer_name' => 'Alex Rivera',
            'customer_email' => 'alex@example.com',
            'customer_contact' => '09171234567',
            'delivery_address' => 'Taguig City',
            'payment_method' => PaymentMethod::EWallet->value,
        ];

        $this->postJson('/api/checkout', $payload + [
            'items' => [['product_id' => $oos->id, 'quantity' => 1, 'expected_unit_price' => (float) $oos->price]],
        ])->assertStatus(409);

        $this->postJson('/api/checkout', $payload + [
            'items' => [['product_id' => $inactive->id, 'quantity' => 1, 'expected_unit_price' => (float) $inactive->price]],
        ])->assertStatus(409);
    }

    public function test_checkout_calculates_exact_php_325_50_total_creates_snapshots_and_deducts_stock(): void
    {
        $this->actAsCustomer();
        $socks = Product::where('name', 'ENVY Crew Socks')->firstOrFail(); // PHP 120.00, stock 40
        $band = Product::where('name', 'ENVY Performance Wristband')->firstOrFail(); // PHP 85.50, stock 35

        $response = $this->postJson('/api/checkout', [
            'customer_name' => 'Alex Rivera',
            'customer_email' => '  Alex.Rivera@Example.COM ',
            'customer_contact' => '+63 917 123 4567',
            'delivery_address' => '123 BGC High Street, Taguig',
            'payment_method' => PaymentMethod::BankTransfer->value,
            'order_notes' => 'Leave at lobby guard',
            'items' => [
                ['product_id' => $socks->id, 'quantity' => 2, 'expected_unit_price' => 120.00],
                ['product_id' => $band->id, 'quantity' => 1, 'expected_unit_price' => 85.50],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', OrderStatus::Pending->value)
            ->assertJsonPath('data.customer_email', 'alex.rivera@example.com')
            ->assertJsonPath('data.subtotal', '325.50')
            ->assertJsonPath('data.total', '325.50');

        $this->assertDatabaseHas('orders', [
            'customer_email' => 'alex.rivera@example.com',
            'subtotal' => '325.50',
            'total' => '325.50',
            'status' => OrderStatus::Pending->value,
        ]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $socks->id,
            'product_name_snapshot' => 'ENVY Crew Socks',
            'unit_price_snapshot' => '120.00',
            'quantity' => 2,
            'line_total' => '240.00',
        ]);

        $this->assertSame(38, $socks->fresh()->stock_quantity);
        $this->assertSame(34, $band->fresh()->stock_quantity);
    }
}
