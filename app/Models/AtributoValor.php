<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AtributoValor extends Model
{
    protected $table = 'atributo_valores';

    protected $fillable = [
        'id_atributo',
        'valor',
        'cod_hex',
        'orden',
    ];

    protected $casts = [
        'id_atributo' => 'integer',
        'orden' => 'integer',
    ];

    public function atributo()
    {
        return $this->belongsTo(Atributo::class, 'id_atributo');
    }

    public function variantes()
    {
        return $this->belongsToMany(Variante::class, 'variante_atributo_valor', 'id_valor', 'id_variante');
    }
}
