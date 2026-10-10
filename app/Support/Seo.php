<?php

namespace App\Support;

use App\Models\Ajuste;
use App\Models\Producto;
use Illuminate\Support\Str;

/**
 * Builds the SEO data of a page. The same array is rendered by the server in
 * <head> (what Google and WhatsApp/Facebook link previews read) and kept up to
 * date by the React <Seo> component while browsing.
 */
class Seo
{
    public static function sitio(): string
    {
        return Ajuste::get('seo_nombre_sitio', config('seo.nombre_sitio'));
    }

    public static function pagina(array $datos = []): array
    {
        $sitio = static::sitio();
        $titulo = filled($datos['titulo'] ?? null)
            ? trim($datos['titulo'])." | {$sitio}"
            : Ajuste::get('seo_titulo_inicio', "{$sitio} | ".config('seo.lema'));

        return [
            'titulo' => $titulo,
            'descripcion' => static::texto(
                filled($datos['descripcion'] ?? null) ? $datos['descripcion'] : Ajuste::get('seo_descripcion', config('seo.descripcion')),
                160,
            ),
            'canonical' => $datos['canonical'] ?? url()->current(),
            'imagen' => static::absoluta($datos['imagen'] ?? null) ?? static::absoluta(Ajuste::get('seo_imagen', config('seo.imagen'))),
            'tipo' => $datos['tipo'] ?? 'website',
            'robots' => $datos['robots'] ?? 'index,follow,max-image-preview:large',
            'sitio' => $sitio,
            'locale' => config('seo.locale'),
            'jsonld' => array_values(array_filter($datos['jsonld'] ?? [])),
        ];
    }

    /** Plain text on one line, cut at a word boundary. */
    public static function texto(?string $texto, int $max): string
    {
        $limpio = trim(preg_replace('/\s+/u', ' ', strip_tags((string) $texto)));

        return Str::limit($limpio, $max, '…', preserveWords: true);
    }

    public static function absoluta(?string $url): ?string
    {
        if (blank($url)) {
            return null;
        }

        return Str::startsWith($url, ['http://', 'https://']) ? $url : url($url);
    }

    public static function organizacion(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => static::sitio(),
            'url' => url('/'),
            'logo' => url('/images/logo-512.png'),
            'sameAs' => config('seo.redes'),
        ];
    }

    /** Lets Google show a search box for the store right in its results. */
    public static function sitioWeb(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => static::sitio(),
            'url' => url('/'),
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => ['@type' => 'EntryPoint', 'urlTemplate' => url('/catalogo').'?search={search_term_string}'],
                'query-input' => 'required name=search_term_string',
            ],
        ];
    }

    /** @param array<array{0: string, 1: string}> $items [name, url] from the home page down */
    public static function migas(array $items): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => collect($items)->values()->map(fn ($item, $i) => [
                '@type' => 'ListItem',
                'position' => $i + 1,
                'name' => $item[0],
                'item' => $item[1],
            ])->all(),
        ];
    }

    /** Product with its price(s) and availability, so Google can show it as a rich result. */
    public static function producto(Producto $producto, array $imagenes, string $descripcion): array
    {
        $variantes = $producto->variantes;
        $precios = $variantes->pluck('precio')->map(fn ($p) => (float) $p);
        $moneda = config('seo.moneda');
        $formato = fn ($n) => number_format($n, 2, '.', '');

        $oferta = null;
        if ($precios->isNotEmpty()) {
            $oferta = $precios->min() === $precios->max()
                ? ['@type' => 'Offer', 'price' => $formato($precios->min())]
                : ['@type' => 'AggregateOffer', 'lowPrice' => $formato($precios->min()), 'highPrice' => $formato($precios->max()), 'offerCount' => $variantes->count()];
            $oferta += [
                'priceCurrency' => $moneda,
                'availability' => $variantes->sum('stock') > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                'itemCondition' => 'https://schema.org/NewCondition',
                'url' => $producto->url,
                'seller' => ['@type' => 'Organization', 'name' => static::sitio()],
            ];
        }

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $producto->nombre,
            'description' => $descripcion,
            'image' => $imagenes,
            'sku' => $variantes->first()?->sku,
            'category' => $producto->categoria?->categoria,
            'brand' => ['@type' => 'Brand', 'name' => static::sitio()],
            'url' => $producto->url,
            'offers' => $oferta,
        ]);
    }
}
