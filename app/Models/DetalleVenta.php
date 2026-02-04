<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleVenta extends Model
{
    protected $table = 'detalle_ventas';

    public function venta(){
        return $this->belongsTo(Venta::class, 'id_venta');
    }

    public function variante(){
        return $this->belongsTo(Variante::class, 'id_variante')->withTrashed();
    }
}
