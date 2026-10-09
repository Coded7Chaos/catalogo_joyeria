<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Variante;
use App\Models\Color;
use App\Models\Talla;
use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogoController extends Controller
{
    public function home(Request $request)
    {
        $categorias = Categoria::all();

        $novedades = Producto::with(['variantes', 'tags', 'variantes.colores'])
            ->whereHas('variantes', fn($q) => $q->where('stock', '>', 0))
            ->latest()
            ->take(8)
            ->get();

        $totalProductos = Producto::count();

        // Catalog data with filters
        $filters = $request->only(['search', 'id_categoria', 'colores', 'tallas', 'precio_min', 'precio_max', 'tags']);

        $productos = Producto::query()
            ->with([
                'variantes:id,id_producto,id_talla,precio,stock,url_foto',
                'tags',
                'variantes.colores:id,color,cod_hex,tipo'
            ])
            ->whereHas('variantes', fn($q) => $q->where('stock', '>', 0))
            ->when($request->input('search'), function ($query, $search) {
                $query->where('nombre', 'like', "%{$search}%");
            })
            ->when($request->input('id_categoria'), function ($query, $idCategoria) {
                $query->where('id_categoria', $idCategoria);
            })
            ->when($request->input('colores'), function ($query, $colores) {
                $query->whereHas('variantes.colores', fn($q) => $q->whereIn('colors.id', $colores));
            })
            ->when($request->input('tallas'), function ($query, $tallas) {
                $query->whereHas('variantes', fn($q) => $q->whereIn('id_talla', $tallas));
            })
            ->when($request->input('precio_min'), function ($query, $min) {
                $query->whereHas('variantes', fn($q) => $q->where('precio', '>=', $min));
            })
            ->when($request->input('precio_max'), function ($query, $max) {
                $query->whereHas('variantes', fn($q) => $q->where('precio', '<=', $max));
            })
            ->when($request->input('tags'), function ($query, $tags) {
                $query->whereHas('tags', fn($q) => $q->whereIn('tags.id', $tags));
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $colores = Color::all();
        $tallas = Talla::all();
        $tags = Tag::all();
        $rangoPrecio = [
            'min' => Variante::min('precio'),
            'max' => Variante::max('precio'),
        ];

        return Inertia::render('Home', [
            'categorias' => $categorias,
            'novedades' => $novedades,
            'totalProductos' => $totalProductos,
            'productos' => $productos,
            'colores' => $colores,
            'tallas' => $tallas,
            'tags' => $tags,
            'rangoPrecio' => $rangoPrecio,
            'filtros' => $filters,
        ]);
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'id_categoria', 'colores', 'tallas', 'precio_min', 'precio_max', 'tags']);

        $productos = Producto::query()
            ->with([
                'variantes:id,id_producto,id_talla,precio,stock,url_foto',
                'tags',
                'variantes.colores:id,color,cod_hex,tipo'
            ])
            ->whereHas('variantes', fn($q) => $q->where('stock', '>', 0))
            ->when($request->input('search'), function ($query, $search) {
                $query->where('nombre', 'like', "%{$search}%");
            })
            ->when($request->input('id_categoria'), function ($query, $idCategoria) {
                $query->where('id_categoria', $idCategoria);
            })
            ->when($request->input('colores'), function ($query, $colores) {
                $query->whereHas('variantes.colores', fn($q) => $q->whereIn('colors.id', $colores));
            })
            ->when($request->input('tallas'), function ($query, $tallas) {
                $query->whereHas('variantes', fn($q) => $q->whereIn('id_talla', $tallas));
            })
            ->when($request->input('precio_min'), function ($query, $min) {
                $query->whereHas('variantes', fn($q) => $q->where('precio', '>=', $min));
            })
            ->when($request->input('precio_max'), function ($query, $max) {
                $query->whereHas('variantes', fn($q) => $q->where('precio', '<=', $max));
            })
            ->when($request->input('tags'), function ($query, $tags) {
                $query->whereHas('tags', fn($q) => $q->whereIn('tags.id', $tags));
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        $categorias = Categoria::all();
        $colores = Color::all();
        $tallas = Talla::all();
        $tags = Tag::all();
        $rangoPrecio = [
            'min' => Variante::min('precio'),
            'max' => Variante::max('precio'),
        ];

        return Inertia::render('Productos/Index', [
            'productos' => $productos,
            'categorias' => $categorias,
            'colores' => $colores,
            'tallas' => $tallas,
            'tags' => $tags,
            'rangoPrecio' => $rangoPrecio,
            'filtros' => $filters,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $producto = Producto::with([
            'categoria:id,categoria',
            'tags:id,descripcion',
            'variantes' => function ($query) {
                $query->where('stock', '>', 0);
            },
            'variantes.colores',
            'variantes.talla'
        ])->findOrFail($id);

        $tagIds = $producto->tags->pluck('id')->toArray();

        $relacionados = Producto::query()
            ->select(['id', 'nombre', 'id_categoria'])
            ->where('id_categoria', $producto->id_categoria)
            ->where('id', '!=', $id)
            ->withCount(['tags as coincidencias' => function ($query) use ($tagIds) {
                $query->whereIn('tags.id', $tagIds);
            }])
            ->having('coincidencias', '>', 0)
            ->orderByDesc('coincidencias')
            ->latest()
            ->with([
                'variantes:id,id_producto,id_talla,precio,stock,url_foto',
                'tags',
                'variantes.colores:id,color,cod_hex,tipo'
            ])
            ->take(4)
            ->get();

        return Inertia::render('Productos/Show', [
            'producto' => $producto,
            'relacionados' => $relacionados
        ]);
    }
}
