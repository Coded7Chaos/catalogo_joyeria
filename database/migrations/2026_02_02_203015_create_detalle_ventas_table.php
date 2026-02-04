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
        Schema::create('detalle_ventas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_venta')->constrained('ventas')->onDelete('cascade');
            $table->foreignId('id_variante')->constrained('variantes')->onDelete('restrict');
            $table->integer('cantidad')->default(1);
            $table->decimal('precio_unitario',10,2);
            $table->decimal('descuento_unitario',10,2)->default(0);
            $table->decimal('subtotal',10,2);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_ventas');
    }
};
