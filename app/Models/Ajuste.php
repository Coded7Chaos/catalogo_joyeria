<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

/**
 * Site settings edited from the admin panel, stored as key/value pairs.
 */
class Ajuste extends Model
{
    protected $table = 'ajustes';
    protected $primaryKey = 'clave';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['clave', 'valor'];

    public static function todos(): array
    {
        return Cache::rememberForever('ajustes', function () {
            // Before the migration runs (first deploy) there is nothing to read yet.
            if (! Schema::hasTable('ajustes')) {
                return [];
            }

            return static::query()->pluck('valor', 'clave')->all();
        });
    }

    public static function get(string $clave, $porDefecto = null)
    {
        $valor = static::todos()[$clave] ?? null;

        return filled($valor) ? $valor : $porDefecto;
    }

    public static function guardar(array $valores): void
    {
        foreach ($valores as $clave => $valor) {
            static::updateOrCreate(['clave' => $clave], ['valor' => $valor]);
        }
        Cache::forget('ajustes');
    }
}
