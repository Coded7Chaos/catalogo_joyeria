<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Laravel\Sanctum\PersonalAccessToken;

class McpRevoke extends Command
{
    protected $signature = 'mcp:revoke {id : ID de la credencial MCP}';

    protected $description = 'Revoca inmediatamente una credencial MCP';

    public function handle(): int
    {
        $token = PersonalAccessToken::find($this->argument('id'));
        if (! $token || ! in_array('mcp:read', $token->abilities ?? [], true)) {
            $this->error('No existe esa credencial MCP.');

            return self::FAILURE;
        }
        $token->delete();
        $this->info('Credencial revocada.');

        return self::SUCCESS;
    }
}
