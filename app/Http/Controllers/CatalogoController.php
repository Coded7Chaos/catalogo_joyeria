<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Variante;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

class CatalogoController extends Controller
{   
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'id_categoria']);

        $esLanding = !$request->has('search') &&
                     !$request->input('id_categoria') &&
                     ($request->input('page', 1) == 1);

        $novedades = [];
        $categoriasDestacadas = [];

        if($esLanding){
            $novedades = Producto::query()
            ->select(['id','nombre', 'url_foto', 'id_categoria'])
            ->with([
                'variantes:id,id_producto,id_talla,url_foto', 
                'tags',
                'variantes.colores:id,color,cod_hex,tipo'
                ])
            ->whereHas('variantes', fn($q) => $q->where('stock', '>', 0))
            ->latest()
            ->take(8)
            ->get();

        }

        $productos = Producto::query()
            ->select(['id','nombre', 'url_foto', 'id_categoria'])
            ->with([
                'variantes:id,id_producto,id_talla,url_foto', 
                'tags',
                'variantes.colores:id,color,cod_hex,tipo'
                ])
            ->whereHas('variantes', fn($q) => $q->where('stock', '>', 0))
            ->when( $request->input('search'), function ($query, $search){
                $query->where('nombre', 'like', "%{$search}%");
            })
            ->when( $request->input('id_categoria'), function ( $query, $idCategoria ){
                $query->where('id_categoria', $idCategoria);
            } )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $categorias = Categoria::all();

        return Inertia::render('Productos/Index', ['productos' => $productos, 'categorias' => $categorias, 'filtros' => $filters, 
        'novedades' => $novedades, 'esLanding' => $esLanding]);
        //return $productos;
    }

    public function show(Request $request, string $id)
    {
        $producto = Producto::with([
            'categoria:id,categoria',
            'tags:id,descripcion',
            'variantes' => function($query) {
                $query->where('stock', '>', 0);
            },
            'variantes.colores',
            'variantes.talla'
        ])->findOrFail($id);

        $tagIds = $producto->tags->pluck('id')->toArray();

        $relacionados = Producto::query()
            ->select(['id','nombre', 'url_foto', 'id_categoria'])
            ->where('id_categoria', $producto->id_categoria)
            ->where('id','!=', $id)
            ->withCount(['tags as coincidencias' => function($query) use ($tagIds){
                $query->whereIn('tags.id', $tagIds);
            }])
            ->having('coincidencias', '>', 0)
            ->orderByDesc('coincidencias')
            ->latest()
            ->with([
                'variantes:id,id_producto,id_talla,url_foto', 
                'tags',
                'variantes.colores:id,color,cod_hex,tipo'
                ])
            ->paginate(8);

        return Inertia::render('Productos/Show',[
            'producto' => $producto,
            'relacionados' => $relacionados
        ]);
    }


}
