<?php

namespace App\Mcp;

use App\Models\Atributo;
use App\Models\AtributoValor;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Proveedor;
use App\Models\Tag;
use App\Models\Variante;

class CatalogoSchema
{
    public const MODELS = [
        'productos' => Producto::class, 'variantes' => Variante::class,
        'categorias' => Categoria::class, 'atributos' => Atributo::class,
        'valores' => AtributoValor::class, 'tags' => Tag::class,
        'proveedores' => Proveedor::class, 'usuarios' => Cliente::class,
    ];

    public static function object(array $properties, array $required = []): array
    {
        return ['type' => 'object', 'properties' => $properties ?: (object) [],
            'required' => $required, 'additionalProperties' => false];
    }

    public static function fields(string $resource, bool $create = false): array
    {
        $text = fn (int $max = 150) => ['type' => 'string', 'maxLength' => $max];
        $nullable = fn (array $schema) => [...$schema, 'type' => [$schema['type'], 'null']];
        $id = ['type' => 'integer', 'minimum' => 1];
        $order = ['type' => 'integer', 'minimum' => 0, 'maximum' => 9999];
        $ids = ['type' => 'array', 'items' => $id, 'maxItems' => 100, 'uniqueItems' => true];
        $images = ['type' => 'array', 'maxItems' => 12, 'items' => self::object([
            'url' => [...$text(2048), 'description' => 'URL https/http o ruta /storage/. Sin descargas remotas.'],
            'alt' => $nullable($text(180)),
        ], ['url'])];
        $variant = [
            'sku' => $nullable($text(50)), 'precio' => ['type' => 'number', 'minimum' => 0, 'maximum' => 99999999.99],
            'stock' => ['type' => 'integer', 'minimum' => 0, 'maximum' => 2147483647],
            'valores' => [...$ids, 'description' => 'IDs de valores: máximo un valor por atributo.'], 'imagenes' => $images,
        ];
        $seo = ['slug' => $nullable($text(160)), 'descripcion' => $nullable($text(5000)),
            'meta_titulo' => $nullable($text(70)), 'meta_descripcion' => $nullable($text(170))];

        return match ($resource) {
            'productos' => ['nombre' => $text(), 'id_categoria' => $id, ...$seo, 'tags' => $ids,
                ...($create ? ['variantes' => ['type' => 'array', 'maxItems' => 100,
                    'items' => self::object($variant, ['precio', 'stock'])]] : [
                        'variantes_new' => ['type' => 'array', 'maxItems' => 100, 'items' => self::object($variant, ['precio', 'stock'])],
                        'variantes_update' => ['type' => 'array', 'maxItems' => 100, 'items' => self::object(['id' => $id, ...$variant], ['id'])],
                        'variantes_delete' => $ids,
                    ])],
            'variantes' => [...($create ? ['id_producto' => $id] : []), ...$variant],
            'categorias' => ['categoria' => $text(), 'parent_id' => [...$nullable($id), 'description' => 'ID padre para subcategoría; null para raíz.'],
                ...$seo, 'imagen' => $nullable($text(2048)), 'orden' => $order],
            'atributos' => ['nombre' => $text(80), 'tipo' => ['type' => 'string', 'enum' => ['texto', 'color']],
                'filtrable' => ['type' => 'boolean'], 'orden' => $order],
            'valores' => [...($create ? ['id_atributo' => $id] : []), 'valor' => $text(80),
                'cod_hex' => [...$nullable($text(7)), 'pattern' => '^#[0-9a-fA-F]{6}$'], 'orden' => $order],
            'tags' => ['descripcion' => $text()],
            'proveedores' => ['nombre' => $text(), 'telefono' => $nullable($text(50)),
                'direccion' => $nullable($text(250)), 'notas' => $nullable($text(5000))],
            'usuarios' => ['nombre' => $text(), 'email' => [...$text(), 'format' => 'email'],
                'telefono' => $text(20), 'role' => ['type' => 'string', 'enum' => ['cliente', 'admin']],
                ...($create ? ['password' => [...$text(255), 'minLength' => 8]] : [])],
            'seo' => ['seo_nombre_sitio' => $nullable($text(60)), 'seo_titulo_inicio' => $nullable($text(70)),
                'seo_descripcion' => $nullable($text(170)), 'seo_imagen' => $nullable($text(2048)),
                'seo_google_verificacion' => $nullable($text(100))],
            'imagenes' => ['base64' => [...$text(14000000), 'description' => 'Bytes de imagen JPG, PNG, GIF o WebP codificados en base64, sin prefijo data:. Máximo 10 MiB.']],
        };
    }

    public static function required(string $resource): array
    {
        return match ($resource) {
            'productos' => ['nombre', 'id_categoria'], 'variantes' => ['id_producto', 'precio', 'stock'],
            'categorias' => ['categoria'], 'atributos' => ['nombre', 'tipo'],
            'valores' => ['id_atributo', 'valor'], 'tags' => ['descripcion'],
            'proveedores' => ['nombre'], 'usuarios' => ['nombre', 'email', 'telefono', 'role', 'password'],
            'imagenes' => ['base64'], default => [],
        };
    }
}
