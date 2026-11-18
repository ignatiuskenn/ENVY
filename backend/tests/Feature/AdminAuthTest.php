<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_routes_require_authentication(): void
    {
        $this->getJson('/api/admin/overview')->assertUnauthorized();
        $this->getJson('/api/admin/products')->assertUnauthorized();
        $this->getJson('/api/admin/categories')->assertUnauthorized();
        $this->getJson('/api/admin/orders')->assertUnauthorized();
        $this->getJson('/api/admin/customers')->assertUnauthorized();
    }

    public function test_admin_can_login_fetch_profile_and_logout(): void
    {
        $this->seed();

        $bad = $this->postJson('/api/admin/login', [
            'email' => 'admin@envy-demo.test',
            'password' => 'wrong-password',
        ]);
        $bad->assertStatus(422);

        $login = $this->postJson('/api/admin/login', [
            'email' => 'admin@envy-demo.test',
            'password' => 'EnvyDemo2026!',
        ]);
        $login->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

        $token = $login->json('token');

        $this->withToken($token)->getJson('/api/admin/me')->assertOk();
        $this->withToken($token)->postJson('/api/admin/logout')->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/admin/overview')->assertUnauthorized();
    }
}
