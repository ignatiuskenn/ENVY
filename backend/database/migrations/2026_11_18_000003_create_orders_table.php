<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 50)->unique();
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_contact', 50);
            $table->text('delivery_address');
            $table->string('payment_method', 50);
            $table->text('order_notes')->nullable();
            $table->string('status', 30)->default('Pending');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('total', 10, 2);
            $table->boolean('stock_restored')->default(false);
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE INDEX orders_normalized_email_idx ON orders (LOWER(TRIM(customer_email)))');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
