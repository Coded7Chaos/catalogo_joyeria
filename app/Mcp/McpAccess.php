<?php

namespace App\Mcp;

use App\Models\Cliente;
use Illuminate\Auth\Access\AuthorizationException;
use Laravel\Sanctum\PersonalAccessToken;

class McpAccess
{
    public function token(): ?PersonalAccessToken
    {
        // Nunca aceptar la sesión del navegador ni reutilizar un token stdio en HTTP.
        $plain = app()->runningInConsole() && ! request()->attributes->get('catalogo_mcp_http', false)
            ? config('catalogo-mcp.token')
            : request()->bearerToken();

        return is_string($plain) && $plain !== '' ? PersonalAccessToken::findToken($plain) : null;
    }

    public function authorize(string $ability = 'mcp:read', bool $users = false): Cliente
    {
        $token = $this->token();
        $user = $token?->tokenable;

        if (! $token || ($token->expires_at && $token->expires_at->isPast())
            || ! $user instanceof Cliente || $user->trashed() || $user->role !== 'admin'
            || ! $token->can('mcp:read') || ! $token->can($ability)
            || ($users && ! $token->can('mcp:users'))) {
            throw new AuthorizationException('La credencial MCP no tiene acceso a esta operación.');
        }

        return $user;
    }
}
