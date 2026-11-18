<?php

namespace Tests\Feature;

use App\Enums\PaymentMethod;
use App\Enums\UserRole;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RbacAndCustomerAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_registration_ignores_role_escalation_and_forces_customer_role(): void
    {
        $res = $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'Jane@Example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'role' => 'admin',
        ]);

        $res->assertCreated()
            ->assertJsonPath('user.email', 'jane@example.com')
            ->assertJsonPath('user.role', UserRole::Customer->value)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertDatabaseHas('users', [
            'email' => 'jane@example.com',
            'role' => UserRole::Customer->value,
        ]);
    }

    public function test_customer_token_is_forbidden_from_admin_routes_and_admin_login(): void
    {
        $this->seed();
        $customer = User::where('email', 'customer@envy-demo.test')->firstOrFail();

        $this->postJson('/api/admin/login', [
            'email' => 'customer@envy-demo.test',
            'password' => 'EnvyCustomer2026!',
        ])->assertForbidden();

        Sanctum::actingAs($customer);

        $this->getJson('/api/admin/overview')->assertForbidden();
        $this->getJson('/api/admin/products')->assertForbidden();
        $this->getJson('/api/admin/categories')->assertForbidden();
        $this->getJson('/api/admin/orders')->assertForbidden();
        $this->getJson('/api/admin/customers')->assertForbidden();
    }

    public function test_unauthenticated_checkout_is_blocked_and_authenticated_customer_links_order(): void
    {
        $this->seed();
        $socks = Product::where('name', 'ENVY Crew Socks')->firstOrFail();
        $customer = User::where('email', 'customer@envy-demo.test')->firstOrFail();

        $payload = [
            'customer_name' => 'Demo Customer',
            'customer_email' => 'customer@envy-demo.test',
            'customer_contact' => '+63 917 555 0199',
            'delivery_address' => 'BGC, Taguig',
            'payment_method' => PaymentMethod::CashOnDelivery->value,
            'items' => [
                ['product_id' => $socks->id, 'quantity' => 1, 'expected_unit_price' => 120.00],
            ],
        ];

        $this->postJson('/api/checkout', $payload)->assertUnauthorized();

        Sanctum::actingAs($customer);
        $this->postJson('/api/checkout', $payload)
            ->assertCreated()
            ->assertJsonPath('data.user_id', $customer->id);
    }
}
