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
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_cliente')->nullable()->constrained('clientes')->onDelete('set null');
            $table->decimal('monto_total',10,2);
            $table->decimal('descuento_global',10,2)->default(0);
            $table->text('url_comprobante');
            $table->string('estado', 50)->default('pendiente');
            $table->text('observaciones');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
};
