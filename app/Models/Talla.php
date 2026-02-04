<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Talla extends Model
{
    use HasFactory;
    protected $fillable = [
        'talla'
    ];

    public function variantes(){
        return $this->hasMany(Variante::class, 'id_talla');
    }
}
