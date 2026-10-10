<?php

namespace App\Models;

use App\Models\Concerns\TieneSlug;
use Illuminate\Database\Eloquent\Model;

/**
 * A variant property defined from the admin panel: Talla, Color, Material, Capacidad…
 * `tipo` = "color" shows its values as swatches (each value has a cod_hex).
 */
class Atributo extends Model
{
    use TieneSlug;

    protected $fillable = [
        'nombre',
        'slug',
        'tipo',
        'filtrable',
        'orden',
    ];

    protected $casts = [
        'filtrable' => 'boolean',
        'orden' => 'integer',
    ];

    protected function slugDesde(): string
    {
        return 'nombre';
    }

    public function valores()
    {
        return $this->hasMany(AtributoValor::class, 'id_atributo')->orderBy('orden')->orderBy('valor');
    }
}
