<?php

use App\Http\Middleware\AuthenticateMcp;
use App\Mcp\Servers\CatalogoServer;
use Illuminate\Support\Facades\Route;
use Laravel\Mcp\Facades\Mcp;

// El paquete aplica validación de Origin y del protocolo. Sin cookies ni CSRF.
Route::middleware([AuthenticateMcp::class, 'throttle:60,1'])->group(function () {
    Mcp::web('/mcp/catalogo', CatalogoServer::class);
});

Mcp::local('catalogo', CatalogoServer::class);
