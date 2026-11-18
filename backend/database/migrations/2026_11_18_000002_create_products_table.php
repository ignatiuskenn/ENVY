<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('stock_quantity')->default(0);
            $table->text('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('category_id');
            $table->index(['is_active', 'category_id', 'price'], 'products_storefront_filter_idx');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price > 0)');
            DB::statement('ALTER TABLE products ADD CONSTRAINT products_stock_non_negative CHECK (stock_quantity >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
