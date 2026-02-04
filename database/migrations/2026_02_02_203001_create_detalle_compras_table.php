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
        Schema::create('detalle_compras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_compra')->constrained('compras')->onDelete('cascade');
            $table->foreignId('id_variante')->constrained('variantes')->onDelete('restrict');
            $table->integer('cantidad')->default(1);
            $table->decimal('costo_unitario',10,2); 
            $table->decimal('costo_adquision_reales',10,2);
            $table->decimal('costo_adquision_bs',10,2);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_compras');
    }
};
