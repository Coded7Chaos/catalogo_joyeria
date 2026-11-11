<?php

namespace App\Console\Commands;

use App\Models\Cliente;
use Illuminate\Console\Command;

class McpToken extends Command
{
    protected $signature = 'mcp:token {email : Correo de un administrador existente}
        {--name=codex : Nombre de la conexión} {--days=30 : Vigencia entre 1 y 365 días}
        {--read-only : Solo consultas} {--allow-delete : Permitir eliminaciones}
        {--users : Permitir gestionar datos de usuarios}
        {--save-local : Guardar en el .env local sin mostrar la credencial}';

    protected $description = 'Crea una credencial MCP revocable para un administrador';

    public function handle(): int
    {
        $admin = Cliente::where('email', $this->argument('email'))->where('role', 'admin')->first();
        $days = filter_var($this->option('days'), FILTER_VALIDATE_INT);
        if (! $admin || $days === false || $days < 1 || $days > 365 || trim($this->option('name')) === '' || strlen($this->option('name')) > 255) {
            $this->error('Se requiere un administrador existente, un nombre y una vigencia de 1 a 365 días.');

            return self::FAILURE;
        }
        if ($this->option('read-only') && $this->option('allow-delete')) {
            $this->error('Solo lectura no se puede combinar con eliminaciones.');

            return self::FAILURE;
        }
        $envPath = $this->laravel->environmentFilePath();
        if ($this->option('save-local') && (! $this->laravel->environment('local') || ! is_writable($envPath))) {
            $this->error('--save-local requiere APP_ENV=local y un .env escribible.');

            return self::FAILURE;
        }
        $abilities = ['mcp:read'];
        if (! $this->option('read-only')) {
            $abilities[] = 'mcp:write';
        }
        if ($this->option('allow-delete')) {
            $abilities[] = 'mcp:delete';
        }
        if ($this->option('users')) {
            $abilities[] = 'mcp:users';
        }
        $token = $admin->createToken($this->option('name'), $abilities, now()->addDays($days));
        if ($this->option('save-local')) {
            $content = file_get_contents($envPath);
            $line = 'CATALOGO_MCP_TOKEN="'.$token->plainTextToken.'"';
            $content = preg_match('/^CATALOGO_MCP_TOKEN=/m', $content)
                ? preg_replace_callback('/^CATALOGO_MCP_TOKEN=.*$/m', fn () => $line, $content)
                : rtrim($content).PHP_EOL.$line.PHP_EOL;
            if (file_put_contents($envPath, $content, LOCK_EX) === false) {
                $token->accessToken->delete();
                $this->error('No se pudo guardar la credencial en .env.');

                return self::FAILURE;
            }
            $this->info('Credencial guardada en el .env local. ID para revocar: '.$token->accessToken->id);

            return self::SUCCESS;
        }
        $this->info('Credencial creada. Se muestra una sola vez; guárdala fuera del repositorio.');
        $this->line($token->plainTextToken);
        $this->line('ID para revocar: '.$token->accessToken->id);

        return self::SUCCESS;
    }
}
