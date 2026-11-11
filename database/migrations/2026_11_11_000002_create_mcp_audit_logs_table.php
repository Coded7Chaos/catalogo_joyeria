<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mcp_audit_logs', function (Blueprint $table) {
            $table->id();
            // Se conserva la referencia histórica aunque se revoque la credencial.
            $table->unsignedBigInteger('cliente_id')->index();
            $table->unsignedBigInteger('token_id')->index();
            $table->string('herramienta', 80);
            $table->unsignedBigInteger('registro_id')->nullable();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mcp_audit_logs');
    }
};
