<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Subcategorías (parent_id) y datos para SEO y la tienda: URL propia (slug),
 * descripción, foto de portada, orden en los menús y metadatos para Google.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('id')->constrained('categorias')->nullOnDelete();
            $table->string('slug', 180)->nullable()->after('categoria');
            $table->text('descripcion')->nullable();
            $table->text('imagen')->nullable();
            $table->unsignedInteger('orden')->default(0);
            $table->string('meta_titulo', 70)->nullable();
            $table->string('meta_descripcion', 170)->nullable();
        });

        $usados = [];
        foreach (DB::table('categorias')->orderBy('id')->get(['id', 'categoria']) as $categoria) {
            $base = Str::slug($categoria->categoria) ?: 'categoria';
            $slug = $base;
            for ($i = 2; isset($usados[$slug]); $i++) {
                $slug = "{$base}-{$i}";
            }
            $usados[$slug] = true;
            DB::table('categorias')->where('id', $categoria->id)->update(['slug' => $slug]);
        }

        Schema::table('categorias', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropConstrainedForeignId('parent_id');
            $table->dropColumn(['slug', 'descripcion', 'imagen', 'orden', 'meta_titulo', 'meta_descripcion']);
        });
    }
};
