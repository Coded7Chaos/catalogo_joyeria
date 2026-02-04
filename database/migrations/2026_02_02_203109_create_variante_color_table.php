<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('variante_color', function (Blueprint $table) {
            $table->foreignId('id_variante')->constrained('variantes')->onDelete('cascade');
            $table->foreignId('id_color')->constrained('colors')->onDelete('cascade');
            $table->primary(['id_variante', 'id_color']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variante_color');
    }
};
