<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Color extends Model
{
    use HasFactory;
    protected $fillable = [
        'color',
        'cod_hex',
        'tipo'
    ];

    public function variantes(){
        return $this->belongsToMany(Variante::class, 'variante_color', 'id_color', 'id_variante');
    }
}
