<?php

namespace App\Http\Controllers;

use App\Models\Atributo;
use App\Models\AtributoValor;
use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Tag;
use App\Models\Variante;
use App\Support\Seo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class CatalogoController extends Controller
{
    private const POR_PAGINA = 12;

    /** What the store cards need: price, stock, cover photo and attribute values. */
    private const CON_VARIANTES = [
        'variantes:id,id_producto,precio,stock,url_foto',
        'variantes.valores:id,id_atributo,valor,cod_hex',
        'variantes.valores.atributo:id,nombre,tipo,orden',
        'tags',
    ];

    public function home(Request $request)
    {
        $catalogo = $this->catalogo($request);

        $novedades = Producto::with(self::CON_VARIANTES)
            ->whereHas('variantes', fn($q) => $q->where('stock', '>', 0))
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('Home', [
            ...$catalogo,
            'novedades' => $novedades,
            'totalProductos' => Producto::count(),
            'seo' => Seo::pagina([
                'canonical' => url('/'),
                'robots' => $this->robotsListado($request),
                'jsonld' => [Seo::organizacion(), Seo::sitioWeb()],
            ]),
        ]);
    }

    public function index(Request $request)
    {
        // Old links filtered by query string move to the category's own page.
        if ($request->filled('id_categoria') && ($categoria = Categoria::find($request->integer('id_categoria')))) {
            return redirect($categoria->url, 301);
        }

        $catalogo = $this->catalogo($request);

        return Inertia::render('Productos/Index', [
            ...$catalogo,
            'categoria' => null,
            'seo' => Seo::pagina([
                'titulo' => 'Catálogo',
                'descripcion' => 'Explora el catálogo completo: '.Seo::texto(config('seo.descripcion'), 120),
                'canonical' => $this->canonicalListado($request, url('/catalogo')),
                'robots' => $this->robotsListado($request),
                'jsonld' => [Seo::migas([['Inicio', url('/')], ['Catálogo', url('/catalogo')]])],
            ]),
        ]);
    }

    public function categoria(Request $request, string $slug)
    {
        $categoria = Categoria::where('slug', $slug)->firstOrFail();
        $catalogo = $this->catalogo($request, $categoria);
        $ruta = $categoria->ruta();

        $migas = [['Inicio', url('/')], ['Catálogo', url('/catalogo')]];
        foreach ($ruta as $c) {
            $migas[] = [$c->categoria, $c->url];
        }

        $nombre = $categoria->categoria;
        $descripcion = $categoria->meta_descripcion
            ?: ($categoria->descripcion ?: "Descubre nuestra selección de {$nombre}: diseños únicos, calidad premium y atención personalizada.");

        return Inertia::render('Productos/Index', [
            ...$catalogo,
            'categoria' => [
                'id' => $categoria->id,
                'categoria' => $nombre,
                'slug' => $categoria->slug,
                'descripcion' => $categoria->descripcion,
                'ruta' => collect($ruta)->map(fn ($c) => ['id' => $c->id, 'categoria' => $c->categoria, 'slug' => $c->slug])->all(),
            ],
            'seo' => Seo::pagina([
                'titulo' => $categoria->meta_titulo ?: $nombre,
                'descripcion' => $descripcion,
                'canonical' => $this->canonicalListado($request, $categoria->url),
                'imagen' => $categoria->imagen,
                'robots' => $this->robotsListado($request),
                'jsonld' => [Seo::migas($migas)],
            ]),
        ]);
    }

    public function show(string $slug)
    {
        $producto = Producto::with([
            'categoria',
            'tags:id,descripcion',
            'variantes' => fn($q) => $q->where('stock', '>', 0)->orderBy('precio'),
            'variantes.valores.atributo',
            'variantes.imagenes',
        ])->where('slug', $slug)->firstOrFail();

        $categoriaIds = $producto->id_categoria ? Categoria::idsConDescendientes(
            $producto->categoria?->parent_id ?? $producto->id_categoria
        ) : [];
        $tagIds = $producto->tags->pluck('id')->toArray();

        // Same family (category and its siblings), pieces sharing tags first.
        $relacionados = Producto::query()
            ->whereIn('id_categoria', $categoriaIds)
            ->where('id', '!=', $producto->id)
            ->whereHas('variantes', fn($q) => $q->where('stock', '>', 0))
            ->withCount(['tags as coincidencias' => fn($q) => $q->whereIn('tags.id', $tagIds)])
            ->orderByDesc('coincidencias')
            ->latest()
            ->with(self::CON_VARIANTES)
            ->take(4)
            ->get();

        $imagenes = $producto->variantes->flatMap(fn ($v) => $v->imagenes->pluck('url'))
            ->merge($producto->variantes->pluck('url_foto'))
            ->filter()->unique()->values()
            ->map(fn ($url) => Seo::absoluta($url))->all();

        $precioMin = $producto->variantes->min('precio');
        $descripcion = $producto->meta_descripcion
            ?: ($producto->descripcion ?: trim("{$producto->nombre}".($producto->categoria ? " · {$producto->categoria->categoria}" : '').
                ($precioMin !== null ? ' desde Bs. '.number_format((float) $precioMin, 2) : '').'. Diseño exclusivo con atención personalizada por WhatsApp.'));

        $migas = [['Inicio', url('/')], ['Catálogo', url('/catalogo')]];
        foreach ($producto->categoria?->ruta() ?? [] as $c) {
            $migas[] = [$c->categoria, $c->url];
        }
        $migas[] = [$producto->nombre, $producto->url];

        return Inertia::render('Productos/Show', [
            'producto' => $producto,
            'ruta' => collect($producto->categoria?->ruta() ?? [])->map(fn ($c) => ['categoria' => $c->categoria, 'slug' => $c->slug])->all(),
            'relacionados' => $relacionados,
            'seo' => Seo::pagina([
                'titulo' => $producto->meta_titulo ?: $producto->nombre,
                'descripcion' => $descripcion,
                'canonical' => $producto->url,
                'imagen' => $imagenes[0] ?? null,
                'tipo' => 'product',
                'jsonld' => [
                    Seo::producto($producto, $imagenes, Seo::texto($producto->descripcion ?: $descripcion, 5000)),
                    Seo::migas($migas),
                ],
            ]),
        ]);
    }

    /** Old product links (/catalogo/15) keep working and pass their ranking to the new URL. */
    public function showPorId(string $id)
    {
        $producto = Producto::findOrFail($id);

        return redirect($producto->url, 301);
    }

    public function sitemap()
    {
        $xml = Cache::remember('sitemap', 3600, function () {
            $urls = collect([
                ['loc' => url('/'), 'lastmod' => Producto::max('updated_at'), 'priority' => '1.0'],
                ['loc' => url('/catalogo'), 'lastmod' => Producto::max('updated_at'), 'priority' => '0.9'],
            ]);

            Categoria::query()->get(['slug', 'updated_at'])->each(fn ($c) => $urls->push([
                'loc' => url('/categoria/'.$c->slug), 'lastmod' => $c->updated_at, 'priority' => '0.8',
            ]));

            Producto::query()->whereHas('variantes', fn($q) => $q->where('stock', '>', 0))
                ->with('variantes:id,id_producto,url_foto')
                ->get(['id', 'slug', 'nombre', 'updated_at'])
                ->each(fn ($p) => $urls->push([
                    'loc' => url('/producto/'.$p->slug),
                    'lastmod' => $p->updated_at,
                    'priority' => '0.7',
                    'imagenes' => $p->variantes->pluck('url_foto')->filter()->unique()->take(5)->map(fn ($u) => Seo::absoluta($u))->values()->all(),
                    'titulo' => $p->nombre,
                ]));

            return view('sitemap', ['urls' => $urls])->render();
        });

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function robots()
    {
        $lineas = [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /mi-cuenta',
            'Disallow: /login',
            'Disallow: /register',
            'Disallow: /forgot-password',
            'Disallow: /reset-password',
            '',
            'Sitemap: '.url('/sitemap.xml'),
        ];

        return response(implode("\n", $lineas)."\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    /**
     * Paginated products with the store filters: search, category (including its
     * subcategories), attribute values (OR within an attribute, AND across them),
     * price range and tags.
     */
    private function catalogo(Request $request, ?Categoria $categoria = null): array
    {
        $filtros = $request->only(['search', 'valores', 'precio_min', 'precio_max', 'tags']);

        $valores = collect((array) $request->input('valores', []))->map(fn ($v) => (int) $v)->filter();
        $porAtributo = $valores->isEmpty()
            ? collect()
            : AtributoValor::whereIn('id', $valores)->get(['id', 'id_atributo'])->groupBy('id_atributo');

        $productos = Producto::query()
            ->with(self::CON_VARIANTES)
            ->whereHas('variantes', fn($q) => $q->where('stock', '>', 0))
            ->when($request->input('search'), function ($query, $search) {
                $query->where(fn ($q) => $q->where('nombre', 'like', "%{$search}%")->orWhere('descripcion', 'like', "%{$search}%"));
            })
            ->when($categoria, fn ($query) => $query->whereIn('id_categoria', Categoria::idsConDescendientes($categoria->id)))
            ->when($porAtributo->isNotEmpty(), function ($query) use ($porAtributo) {
                foreach ($porAtributo as $grupo) {
                    $query->whereHas('variantes.valores', fn($q) => $q->whereIn('atributo_valores.id', $grupo->pluck('id')));
                }
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
            ->paginate(self::POR_PAGINA)
            ->withQueryString();

        return [
            'productos' => $productos,
            'atributos' => Atributo::where('filtrable', true)->with('valores:id,id_atributo,valor,cod_hex,orden')->orderBy('orden')->orderBy('nombre')->get(),
            'tags' => Tag::orderBy('descripcion')->get(),
            'rangoPrecio' => [
                'min' => Variante::min('precio'),
                'max' => Variante::max('precio'),
            ],
            'filtros' => $filtros,
        ];
    }

    /** Filtered or searched listings are not worth indexing (thin, duplicate content). */
    private function robotsListado(Request $request): string
    {
        return $request->hasAny(['search', 'valores', 'precio_min', 'precio_max', 'tags'])
            ? 'noindex,follow'
            : 'index,follow,max-image-preview:large';
    }

    private function canonicalListado(Request $request, string $base): string
    {
        $pagina = (int) $request->input('page', 1);

        return $pagina > 1 ? "{$base}?page={$pagina}" : $base;
    }
}
