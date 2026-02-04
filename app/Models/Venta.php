<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    protected $fillable= [
        'id_cliente',
        'monto_total',
        'descuento_global',
        'url_comprobante',
        'estado',
        'observaciones'
    ];

    public function detallesVentas(){
        return $this->hasMany(DetalleVenta::class, 'id_venta');
    }

    public function cliente(){
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    
}
