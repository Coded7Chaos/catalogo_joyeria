<?php

namespace App\Mcp\Tools;

use App\Mcp\CatalogoSchema;
use App\Mcp\McpAccess;
use App\Services\CatalogoManager;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool;
use Throwable;

class CatalogoTool extends Tool
{
    public function __construct(public string $resource, public string $action)
    {
        $this->name = $resource.'_'.$action;
        $this->title = ucfirst($action).' '.$resource;
        $this->description = match ($action) {
            'listar' => 'Lista y busca '.$resource.' con paginación, sin registros eliminados.',
            'obtener' => 'Lee el detalle de '.$resource.'.',
            'crear' => 'Crea '.$resource.' y devuelve el registro con su ID.',
            'actualizar' => 'Actualiza parcialmente '.$resource.'. Los campos omitidos se conservan; las listas enviadas se reemplazan.',
            'eliminar' => 'Elimina '.$resource.' por ID; rechaza registros asociados. Requiere confirmar=true.',
        };
        if ($resource === 'categorias') {
            $this->description .= ' Incluye subcategorías: usa parent_id para indicar la categoría padre.';
        }
        if ($resource === 'imagenes') {
            $this->description = 'Sube una foto en base64 al almacenamiento del catálogo y devuelve su URL para usarla en una variante o categoría.';
        }
    }

    public function ability(): string
    {
        return match ($this->action) {
            'listar', 'obtener' => 'mcp:read', 'eliminar' => 'mcp:delete', default => 'mcp:write',
        };
    }

    public function shouldRegister(): bool
    {
        try {
            app(McpAccess::class)->authorize($this->ability(), $this->resource === 'usuarios');

            return true;
        } catch (AuthorizationException) {
            return false;
        }
    }

    private function inputSchema(): array
    {
        $id = ['type' => 'integer', 'minimum' => 1];
        if ($this->action === 'listar') {
            $fields = ['search' => ['type' => 'string', 'maxLength' => 150],
                'page' => $id, 'per_page' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 100]];
            $filter = match ($this->resource) {
                'productos' => 'id_categoria', 'categorias' => 'parent_id',
                'variantes' => 'id_producto', 'valores' => 'id_atributo', default => null,
            };
            if ($filter) {
                $fields[$filter] = $this->resource === 'categorias' ? ['type' => ['integer', 'null'], 'minimum' => 1] : $id;
            }

            return CatalogoSchema::object($fields);
        }
        $fields = $this->resource !== 'seo' && $this->action !== 'crear' ? ['id' => $id] : [];
        $required = array_keys($fields);
        if (in_array($this->action, ['crear', 'actualizar'])) {
            $fields['datos'] = CatalogoSchema::object(CatalogoSchema::fields($this->resource, $this->action === 'crear'),
                $this->action === 'crear' ? CatalogoSchema::required($this->resource) : []);
            $required[] = 'datos';
        }
        if ($this->action === 'eliminar') {
            $fields['confirmar'] = ['type' => 'boolean', 'const' => true];
            $required[] = 'confirmar';
        }

        return CatalogoSchema::object($fields, $required);
    }

    public function toArray(): array
    {
        return [...parent::toArray(), 'inputSchema' => $this->inputSchema(), 'annotations' => [
            'readOnlyHint' => $this->ability() === 'mcp:read',
            'destructiveHint' => in_array($this->action, ['actualizar', 'eliminar']),
            'idempotentHint' => $this->ability() === 'mcp:read', 'openWorldHint' => false,
        ]];
    }

    public function handle(Request $request): Response|ResponseFactory
    {
        $uploadedUrl = null;
        try {
            // Se revalida en cada llamada, también en conexiones stdio persistentes.
            $actor = app(McpAccess::class)->authorize($this->ability(), $this->resource === 'usuarios');
            $args = $request->all();
            if (array_diff(array_keys($args), array_keys((array) $this->inputSchema()['properties']))) {
                throw ValidationException::withMessages(['argumentos' => 'Hay argumentos desconocidos.']);
            }
            $rules = ['id' => 'sometimes|required|integer|min:1', 'search' => 'sometimes|string|max:150',
                'page' => 'sometimes|required|integer|min:1', 'per_page' => 'sometimes|required|integer|min:1|max:100'];
            foreach ($this->inputSchema()['required'] as $key) {
                $rules[$key] = match ($key) {
                    'id' => 'required|integer|min:1', 'datos' => 'present|array', 'confirmar' => 'required|accepted',
                };
            }
            foreach (['id_categoria', 'id_producto', 'id_atributo', 'parent_id'] as $key) {
                $rules[$key] = ($key === 'parent_id' ? 'nullable' : 'sometimes|required').'|integer|min:1';
            }
            Validator::make($args, $rules)->validate();
            if ($this->action === 'eliminar' && ($args['confirmar'] ?? null) !== true) {
                throw ValidationException::withMessages(['confirmar' => 'Debe ser el booleano true.']);
            }
            $manager = app(CatalogoManager::class);
            if ($this->ability() === 'mcp:read') {
                return Response::structured($manager->read($this->resource, $args));
            }
            $result = DB::transaction(function () use ($manager, $args, $actor, &$uploadedUrl) {
                $result = $this->action === 'eliminar'
                    ? $manager->delete($this->resource, $args['id'], $actor)
                    : $manager->save($this->resource, $args['datos'], $args['id'] ?? null, $actor);
                if ($this->resource === 'imagenes') {
                    $uploadedUrl = $result['url'];
                }
                DB::table('mcp_audit_logs')->insert([
                    'cliente_id' => $actor->id, 'token_id' => app(McpAccess::class)->token()->id,
                    'herramienta' => $this->name, 'registro_id' => $result['datos']['id'] ?? $result['id'] ?? null,
                    'created_at' => now(),
                ]);

                return $result;
            });
            $uploadedUrl = null;

            return Response::structured($result);
        } catch (ValidationException $e) {
            return Response::error(json_encode(['mensaje' => 'Datos inválidos.', 'errores' => $e->errors()], JSON_UNESCAPED_UNICODE));
        } catch (AuthorizationException) {
            return Response::error('Acceso denegado: credencial vencida, revocada o sin permiso.');
        } catch (ModelNotFoundException) {
            return Response::error('Registro no encontrado o eliminado.');
        } catch (Throwable $e) {
            if ($uploadedUrl) {
                Storage::disk('public')->delete(substr($uploadedUrl, strlen('/storage/')));
            }
            report($e);

            return Response::error('No se pudo completar la operación. Revisa los registros del servidor.');
        }
    }
}
