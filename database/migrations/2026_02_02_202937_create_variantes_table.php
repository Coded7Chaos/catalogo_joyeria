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
        Schema::create('variantes', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 50)->nullable()->unique();

            $table-> foreignId('id_producto')->constrained('productos')->onDelete('cascade');
            $table-> foreignId('id_talla')->nullable()->constrained('tallas')->onDelete('set null');
            $table->decimal('precio', 10, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->text('url_foto')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('variantes');
    }
};
