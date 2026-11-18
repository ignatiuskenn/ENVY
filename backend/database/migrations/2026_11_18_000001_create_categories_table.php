<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE UNIQUE INDEX categories_name_lower_unique ON categories (LOWER(TRIM(name)))');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
