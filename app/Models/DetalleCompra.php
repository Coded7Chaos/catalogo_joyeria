<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleCompra extends Model
{
    protected $fillable = [
        'id_compra',
        'id_variante',
        'cantidad',
        'costo_unitario',
        'costo_adquisicion_reales',
        'costo_adquisicion_bs'
    ];

    public function compra(){
        return $this->belongsTo(Compra::class, 'id_compra');
    }

    public function variante(){
        return $this->belongsTo(Variante::class, 'id_variante')->withTrashed();
    }
}
