<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * URL propia para cada producto (/producto/{slug}), descripción y metadatos para Google.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->string('slug', 180)->nullable()->after('nombre');
            $table->text('descripcion')->nullable();
            $table->string('meta_titulo', 70)->nullable();
            $table->string('meta_descripcion', 170)->nullable();
        });

        $usados = [];
        foreach (DB::table('productos')->orderBy('id')->get(['id', 'nombre']) as $producto) {
            $base = Str::slug($producto->nombre) ?: 'producto';
            $slug = $base;
            for ($i = 2; isset($usados[$slug]); $i++) {
                $slug = "{$base}-{$i}";
            }
            $usados[$slug] = true;
            DB::table('productos')->where('id', $producto->id)->update(['slug' => $slug]);
        }

        Schema::table('productos', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'descripcion', 'meta_titulo', 'meta_descripcion']);
        });
    }
};
