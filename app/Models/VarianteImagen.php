<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VarianteImagen extends Model
{
    protected $table = 'variante_imagenes';

    protected $fillable = [
        'id_variante',
        'url',
        'alt',
        'orden',
    ];

    public function variante()
    {
        return $this->belongsTo(Variante::class, 'id_variante');
    }
}
