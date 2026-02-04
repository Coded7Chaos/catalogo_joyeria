<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Variante;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;

class ProductoController extends Controller
{
    
    public function index()
    {
        $filters = $request->only(['search', 'id_categoria']);

        $productos = Producto::query()
            ->with(['categoria', 'variantes'])
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

        return Inertia::render('Productos/Index', ['productos' => $productos, 'categorias' => $categorias, 'filtros' => $filters]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categorias = Categoria::all();
        return Inertia::render('Productos/Create', ['categorias' => $categorias]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            //datos del producto
            'nombre' => 'required|string|max:150',
            'url_foto' => 'nullable|url',
            'id_categoria' => 'required|exists:categorias,id',
            //datos de las variantes 
            'variantes' => 'required|array|min:1',
            'variantes.*.sku' => 'nullable|unique:variantes,sku',
            'variantes.*.id_talla' => 'nullable|exists:tallas,id',
            'variantes.*.precio' => 'nullable|numeric|min:0|max:99999',
            'variantes.*.stock' => 'nullable|integer|min:0|max:99999',
            'variantes.*.url_foto' => 'nullable|url',
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
