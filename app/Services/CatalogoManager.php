<?php

namespace App\Services;

use App\Mcp\CatalogoSchema;
use App\Models\Ajuste;
use App\Models\AtributoValor;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Variante;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CatalogoManager
{
    public function query(string $resource)
    {
        $query = CatalogoSchema::MODELS[$resource]::query();

        return match ($resource) {
            'productos' => $query->with(['categoria', 'tags', 'variantes.valores.atributo', 'variantes.imagenes']),
            'variantes' => $query->whereHas('producto')->with(['valores.atributo', 'imagenes']),
            'categorias' => $query->withCount(['productos', 'hijas']),
            'atributos' => $query->with('valores'),
            'valores' => $query->with('atributo'),
            default => $query,
        };
    }

    public function read(string $resource, array $args): array
    {
        if ($resource === 'seo') {
            return ['datos' => collect(array_keys(CatalogoSchema::fields('seo')))
                ->mapWithKeys(fn ($key) => [$key => Ajuste::get($key, '')])->all()];
        }
        $query = $this->query($resource);
        if (isset($args['id'])) {
            return ['datos' => $query->findOrFail($args['id'])->toArray()];
        }
        if (isset($args['search']) && $args['search'] !== '') {
            $field = match ($resource) {
                'categorias' => 'categoria', 'tags' => 'descripcion', 'valores' => 'valor',
                'variantes' => 'sku', default => 'nombre',
            };
            $query->where($field, 'like', '%'.$args['search'].'%');
        }
        foreach (['id_categoria', 'parent_id', 'id_producto', 'id_atributo'] as $field) {
            if (array_key_exists($field, $args)) {
                $query->where($field, $args[$field]);
            }
        }
        $page = $query->orderBy('id')->paginate($args['per_page'] ?? 20, ['*'], 'page', $args['page'] ?? 1);

        return ['datos' => $page->items(), 'pagina' => $page->currentPage(),
            'por_pagina' => $page->perPage(), 'total' => $page->total(), 'ultima_pagina' => $page->lastPage()];
    }

    public function save(string $resource, array $data, ?int $id = null, ?Cliente $actor = null): array
    {
        return DB::transaction(function () use ($resource, $data, $id, $actor) {
            $model = $id ? $this->query($resource)->lockForUpdate()->findOrFail($id) : null;
            $this->validate($resource, $data, $model);
            if ($resource === 'seo') {
                Ajuste::guardar($data);
                Cache::forget('sitemap');
                // No cachear datos antes de que la transacción y su auditoría se confirmen.
                $settings = Ajuste::query()->pluck('valor', 'clave');

                return ['datos' => collect(array_keys(CatalogoSchema::fields('seo')))
                    ->mapWithKeys(fn ($key) => [$key => $settings[$key] ?? ''])->all()];
            }
            if ($resource === 'imagenes') {
                return $this->image($data['base64']);
            }
            if ($resource === 'usuarios' && $model?->id === $actor?->id && isset($data['role']) && $data['role'] !== 'admin') {
                throw ValidationException::withMessages(['role' => 'No puedes quitarte el rol de administrador a ti mismo.']);
            }
            $attributes = array_diff_key($data, array_flip(['tags', 'variantes', 'variantes_new', 'variantes_update', 'variantes_delete', 'valores', 'imagenes']));
            $model = $model ? tap($model)->update($attributes) : CatalogoSchema::MODELS[$resource]::create($attributes);
            if ($resource === 'productos') {
                if (array_key_exists('tags', $data)) {
                    $model->tags()->sync($data['tags']);
                }
                // Validar propiedad y solapamientos antes de modificar cualquier variante.
                $updates = collect($data['variantes_update'] ?? [])->pluck('id')->all();
                $deletes = $data['variantes_delete'] ?? [];
                $ids = [...$updates, ...$deletes];
                if (count($ids) !== count(array_unique($ids)) || $model->variantes()->whereIn('id', $ids)->count() !== count($ids)) {
                    throw ValidationException::withMessages(['variantes' => 'IDs repetidos, eliminados o que pertenecen a otro producto.']);
                }
                foreach ($deletes as $variantId) {
                    $model->variantes()->findOrFail($variantId)->delete();
                }
                foreach ($data['variantes_update'] ?? [] as $variant) {
                    $variantId = $variant['id'];
                    unset($variant['id']);
                    $this->save('variantes', $variant, $variantId, $actor);
                }
                foreach ([...($data['variantes'] ?? []), ...($data['variantes_new'] ?? [])] as $variant) {
                    $this->save('variantes', ['id_producto' => $model->id, ...$variant], actor: $actor);
                }
            }
            if ($resource === 'variantes') {
                if (array_key_exists('valores', $data)) {
                    $model->valores()->sync($data['valores']);
                }
                if (array_key_exists('imagenes', $data)) {
                    $model->guardarImagenes($data['imagenes']);
                }
                Cache::forget('sitemap');
            }

            return ['datos' => $this->query($resource)->findOrFail($model->id)->toArray()];
        });
    }

    private function validate(string $resource, array $data, ?Model $model): void
    {
        $fields = CatalogoSchema::fields($resource, ! $model);
        if (array_diff(array_keys($data), array_keys($fields))) {
            throw ValidationException::withMessages(['datos' => 'Hay campos desconocidos o que no se pueden editar.']);
        }
        if ($data === []) {
            throw ValidationException::withMessages(['datos' => 'Envía al menos un campo.']);
        }
        $rules = $this->rules($resource, $data, $model);
        $validationData = $resource === 'categorias' && $model
            ? ['categoria' => $model->categoria, ...$data] : $data;
        Validator::make($validationData, $rules)->validate();
        // Los esquemas se aplican también a llamadas directas sin un cliente MCP.
        foreach ($data as $key => $value) {
            if (is_array($value) && ! array_is_list($value)) {
                throw ValidationException::withMessages([$key => 'Se esperaba una lista.']);
            }
        }
        if ($resource === 'categorias' && $model && isset($data['parent_id'])
            && in_array((int) $data['parent_id'], Categoria::idsConDescendientes($model->id), true)) {
            throw ValidationException::withMessages(['parent_id' => 'Una categoría no puede estar dentro de sí misma ni de sus subcategorías.']);
        }
        if ($resource === 'variantes') {
            $values = $data['valores'] ?? [];
            $attributes = AtributoValor::whereIn('id', $values)->pluck('id_atributo');
            if ($attributes->count() !== $attributes->unique()->count()) {
                throw ValidationException::withMessages(['valores' => 'Cada variante puede tener un solo valor por atributo.']);
            }
            // Un producto borrado no puede recibir variantes, ni ser editado a través de ellas.
            Producto::findOrFail($data['id_producto'] ?? $model?->id_producto);
        }
    }

    private function rules(string $resource, array $data, ?Model $model): array
    {
        $required = $model ? 'sometimes|required' : 'required';
        $order = 'sometimes|required|integer|min:0|max:9999';
        $slug = ['sometimes', 'nullable', 'string', 'max:160', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            Rule::unique($model?->getTable() ?? ($resource === 'categorias' ? 'categorias' : 'productos'), 'slug')->ignore($model?->id)];
        $seo = ['slug' => $slug, 'descripcion' => 'nullable|string|max:5000',
            'meta_titulo' => 'nullable|string|max:70', 'meta_descripcion' => 'nullable|string|max:170'];
        $variant = [
            'sku' => ['sometimes', 'nullable', 'string', 'max:50', Rule::unique('variantes', 'sku')->ignore($model?->id)],
            'precio' => "$required|numeric|min:0|max:99999999.99", 'stock' => "$required|integer|min:0|max:2147483647",
            'valores' => 'sometimes|array|max:100', 'valores.*' => 'required|integer|distinct|exists:atributo_valores,id',
            'imagenes' => 'sometimes|array|max:12', 'imagenes.*' => 'required|array:url,alt',
            'imagenes.*.url' => ['required', 'string', 'max:2048', 'regex:~^(?:https?://[^\s]+|/storage/[^\s]+)$~i'],
            'imagenes.*.alt' => 'nullable|string|max:180',
        ];

        return match ($resource) {
            'productos' => ['nombre' => "$required|string|max:150", 'id_categoria' => "$required|integer|exists:categorias,id", ...$seo,
                'tags' => 'sometimes|array|max:100', 'tags.*' => 'required|integer|distinct|exists:tags,id',
                'variantes' => 'sometimes|array|max:100', 'variantes.*' => 'required|array:sku,precio,stock,valores,imagenes',
                'variantes_new' => 'sometimes|array|max:100', 'variantes_new.*' => 'required|array:sku,precio,stock,valores,imagenes',
                'variantes_update' => 'sometimes|array|max:100', 'variantes_update.*' => 'required|array:id,sku,precio,stock,valores,imagenes',
                'variantes_update.*.id' => 'required|integer',
                'variantes_delete' => 'sometimes|array|max:100', 'variantes_delete.*' => 'required|integer|distinct'],
            'variantes' => ['id_producto' => "$required|integer|exists:productos,id", ...$variant],
            'categorias' => ['categoria' => [$model ? 'sometimes' : 'required', 'required', 'string', 'max:150',
                Rule::unique('categorias', 'categoria')->where('parent_id', array_key_exists('parent_id', $data) ? $data['parent_id'] : $model?->parent_id)->ignore($model?->id)],
                'parent_id' => 'nullable|integer|exists:categorias,id', ...$seo,
                'imagen' => ['nullable', 'string', 'max:2048', 'regex:~^(?:https?://[^\s]+|/storage/[^\s]+)$~i'], 'orden' => $order],
            'atributos' => ['nombre' => [$model ? 'sometimes' : 'required', 'required', 'string', 'max:80', Rule::unique('atributos', 'nombre')->ignore($model?->id)],
                'tipo' => "$required|in:texto,color", 'filtrable' => 'sometimes|required|boolean', 'orden' => $order],
            'valores' => ['id_atributo' => "$required|integer|exists:atributos,id",
                'valor' => [$model ? 'sometimes' : 'required', 'required', 'string', 'max:80', Rule::unique('atributo_valores', 'valor')
                    ->where('id_atributo', $data['id_atributo'] ?? $model?->id_atributo)->ignore($model?->id)],
                'cod_hex' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'], 'orden' => $order],
            'tags' => ['descripcion' => [$model ? 'sometimes' : 'required', 'required', 'string', 'max:150', Rule::unique('tags', 'descripcion')->ignore($model?->id)]],
            'proveedores' => ['nombre' => "$required|string|max:150", 'telefono' => 'nullable|string|max:50',
                'direccion' => 'nullable|string|max:250', 'notas' => 'nullable|string|max:5000'],
            'usuarios' => ['nombre' => "$required|string|max:150", 'email' => [$model ? 'sometimes' : 'required', 'required', 'string', 'email', 'lowercase', 'max:150', Rule::unique('clientes', 'email')->ignore($model?->id)],
                'telefono' => [$model ? 'sometimes' : 'required', 'required', 'string', 'max:20', 'regex:'.Cliente::REGEX_TELEFONO],
                'role' => "$required|in:admin,cliente", 'password' => ($model ? 'sometimes|required' : 'required').'|string|min:8|max:255'],
            'seo' => ['seo_nombre_sitio' => 'nullable|string|max:60', 'seo_titulo_inicio' => 'nullable|string|max:70',
                'seo_descripcion' => 'nullable|string|max:170', 'seo_imagen' => ['nullable', 'string', 'max:2048', 'regex:~^(?:https?://[^\s]+|/storage/[^\s]+)$~i'],
                'seo_google_verificacion' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9_\-]+$/']],
            'imagenes' => ['base64' => 'required|string|max:14000000'],
        };
    }

    public function delete(string $resource, int $id, ?Cliente $actor = null): array
    {
        return DB::transaction(function () use ($resource, $id, $actor) {
            $model = $this->query($resource)->lockForUpdate()->findOrFail($id);
            $inUse = match ($resource) {
                'categorias' => $model->hijas()->exists() || Producto::withTrashed()->where('id_categoria', $id)->exists(),
                'atributos' => DB::table('variante_atributo_valor')->whereIn('id_valor', $model->valores()->select('id'))->exists(),
                'valores' => DB::table('variante_atributo_valor')->where('id_valor', $id)->exists(),
                'tags' => DB::table('tags_productos')->where('id_tag', $id)->exists(),
                'proveedores' => $model->compras()->exists(),
                'usuarios' => $id === $actor?->id,
                default => false,
            };
            if ($inUse) {
                throw ValidationException::withMessages(['id' => 'No se puede eliminar: tiene registros asociados o es tu propia cuenta.']);
            }
            $model->delete();
            Cache::forget('sitemap');

            return ['id' => $id, 'eliminado' => true, 'borrado_logico' => method_exists($model, 'trashed')];
        });
    }

    private function image(string $base64): array
    {
        $bytes = base64_decode($base64, true);
        $info = $bytes !== false ? @getimagesizefromstring($bytes) : false;
        $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
        if (! $info || strlen($bytes) > 10485760 || ! isset($extensions[$info['mime']])
            || $info[0] * $info[1] > 40000000) {
            throw ValidationException::withMessages(['base64' => 'Imagen inválida: JPG, PNG, GIF o WebP, hasta 10 MiB y 40 megapíxeles.']);
        }
        // No se aceptan rutas locales ni URLs a descargar desde el servidor.
        $path = 'catalogo/'.Str::random(40).'.'.$extensions[$info['mime']];
        if (! Storage::disk('public')->put($path, $bytes)) {
            throw new \RuntimeException('No se pudo guardar la imagen.');
        }

        return ['url' => '/storage/'.$path];
    }
}
