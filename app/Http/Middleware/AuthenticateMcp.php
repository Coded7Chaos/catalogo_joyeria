<?php

namespace App\Http\Middleware;

use App\Mcp\McpAccess;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;

class AuthenticateMcp
{
    public function handle(Request $request, Closure $next)
    {
        $request->attributes->set('catalogo_mcp_http', true);
        try {
            $user = app(McpAccess::class)->authorize();
        } catch (AuthorizationException) {
            return response()->json(['message' => 'Credencial MCP ausente, vencida o sin acceso administrativo.'], 401)
                ->header('WWW-Authenticate', 'Bearer');
        }

        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
