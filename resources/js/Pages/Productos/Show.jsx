import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';
import StoreImage from '@/Components/Store/StoreImage';
import RailCard from '@/Components/Store/RailCard';
import Seo from '@/Components/Store/Seo';
import { ChevronLeft, ChevronRight, HeartIcon, WhatsAppIcon } from '@/Components/Store/Icons';
import { categoriaUrl, contacto, etiquetaVariante, formatPrice, whatsappUrl } from '@/lib/catalogo';

function Availability({ stock }) {
    if (stock <= 0) {
        return (
            <>
                <span className="h-2 w-2 rounded-full bg-vino-soft" /> Agotado
            </>
        );
    }
    if (stock <= 3) {
        return (
            <>
                <span className="h-2 w-2 rounded-full bg-champan" />
                {stock === 1 ? 'Última unidad' : `Quedan ${stock}`}
            </>
        );
    }
    return (
        <>
            <span className="h-2 w-2 rounded-full bg-emerald-600" /> En stock
        </>
    );
}

/** Photos of a variant: its gallery, or its cover for data saved before galleries existed. */
const fotosDe = (v) => {
    const fotos = (v?.imagenes ?? []).map((img) => ({ url: img.url, alt: img.alt }));
    return fotos.length ? fotos : v?.url_foto ? [{ url: v.url_foto, alt: null }] : [];
};

/** {atributoId: valorId} of a variant. */
const seleccionDe = (v) => Object.fromEntries((v?.valores ?? []).map((val) => [val.id_atributo, val.id]));

export default function Show({ producto, ruta = [], relacionados, seo }) {
    const variantes = producto.variantes ?? [];

    // The attributes this product varies on (e.g. Color and Talla), each with the values it comes in.
    const atributos = useMemo(() => {
        const mapa = new Map();
        for (const v of variantes) {
            for (const val of v.valores ?? []) {
                const a = val.atributo;
                if (!a) continue;
                if (!mapa.has(a.id)) mapa.set(a.id, { ...a, valores: new Map() });
                mapa.get(a.id).valores.set(val.id, val);
            }
        }
        return [...mapa.values()]
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.nombre.localeCompare(b.nombre))
            .map((a) => ({ ...a, valores: [...a.valores.values()].sort((x, y) => (x.orden ?? 0) - (y.orden ?? 0)) }));
    }, [variantes]);

    const [seleccion, setSeleccion] = useState(() => seleccionDe(variantes[0]));
    const [fotoIndex, setFotoIndex] = useState(0);
    const [saved, setSaved] = useState(false);

    const coincide = (v, sel) => Object.entries(sel).every(([a, val]) => seleccionDe(v)[a] === val);
    const variante = variantes.find((v) => coincide(v, seleccion)) ?? variantes[0] ?? null;

    const elegir = (atributoId, valorId) => {
        const nueva = { ...seleccion, [atributoId]: valorId };
        // If that combination doesn't exist, jump to the first variant with the chosen value.
        const destino = variantes.find((v) => coincide(v, nueva)) ?? variantes.find((v) => seleccionDe(v)[atributoId] === valorId);
        setSeleccion(destino ? seleccionDe(destino) : nueva);
        setFotoIndex(0);
    };

    // The chosen variant's photos first, then the rest of the product's (without repeats).
    const fotos = useMemo(() => {
        const vistas = new Set();
        return [variante, ...variantes.filter((v) => v !== variante)]
            .flatMap(fotosDe)
            .filter((f) => !vistas.has(f.url) && vistas.add(f.url));
    }, [variante, variantes]);
    const foto = fotos[fotoIndex] ?? fotos[0];

    const disponible = (atributoId, valorId) =>
        variantes.some((v) => coincide(v, { ...seleccion, [atributoId]: valorId }));

    const prices = variantes.map((v) => parseFloat(v.precio)).filter((p) => !isNaN(p));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

    const mensaje = `Hola, me interesa: ${producto.nombre}${variante?.valores?.length ? ` (${etiquetaVariante(variante)})` : ''}`;

    const prev = () => setFotoIndex((i) => (i === 0 ? fotos.length - 1 : i - 1));
    const next = () => setFotoIndex((i) => (i >= fotos.length - 1 ? 0 : i + 1));

    return (
        <CatalogoLayout>
            <Seo seo={seo} />

            <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-8 lg:pb-24 lg:pt-10">
                {/* Breadcrumb */}
                <nav aria-label="Ruta">
                    <ol className="flex flex-wrap items-center gap-2 text-[13px] uppercase tracking-[0.16em] text-tinta/55">
                        <li>
                            <Link href="/" className="hover:text-vino">
                                Inicio
                            </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li>
                            <Link href="/catalogo" className="hover:text-vino">
                                Catálogo
                            </Link>
                        </li>
                        {ruta.map((c) => (
                            <li key={c.slug} className="flex items-center gap-2">
                                <span aria-hidden="true">/</span>
                                <Link href={categoriaUrl(c)} className="hover:text-vino">
                                    {c.categoria}
                                </Link>
                            </li>
                        ))}
                        <li aria-hidden="true">/</li>
                        <li aria-current="page" className="truncate text-tinta">
                            {producto.nombre}
                        </li>
                    </ol>
                </nav>

                <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
                    {/* Gallery */}
                    <div>
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-rosa">
                            <StoreImage
                                key={foto?.url ?? 'sin-foto'}
                                src={foto?.url}
                                alt={foto?.alt || `${producto.nombre}${variante?.valores?.length ? ` · ${etiquetaVariante(variante)}` : ''}`}
                                fetchpriority="high"
                                className="absolute inset-0 h-full w-full animate-rise object-cover"
                            />
                            {fotos.length > 1 && (
                                <>
                                    <button
                                        onClick={prev}
                                        aria-label="Foto anterior"
                                        className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-tinta shadow-md transition hover:bg-vino hover:text-white"
                                    >
                                        <ChevronLeft />
                                    </button>
                                    <button
                                        onClick={next}
                                        aria-label="Foto siguiente"
                                        className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-tinta shadow-md transition hover:bg-vino hover:text-white"
                                    >
                                        <ChevronRight />
                                    </button>
                                    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
                                        {fotos.map((f, i) => (
                                            <span
                                                key={f.url}
                                                className={`h-2 rounded-full transition-all ${i === fotoIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        {fotos.length > 1 && (
                            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
                                {fotos.map((f, i) => (
                                    <button
                                        key={f.url}
                                        onClick={() => setFotoIndex(i)}
                                        aria-label={`Ver foto ${i + 1}`}
                                        className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-[14px] bg-rosa ring-2 transition ${
                                            i === fotoIndex ? 'ring-vino' : 'ring-transparent hover:ring-vino/30'
                                        }`}
                                    >
                                        <StoreImage src={f.url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col lg:py-4">
                        {producto.categoria && (
                            <p className="text-[11px] uppercase tracking-[0.2em] text-vino-soft">{producto.categoria.categoria}</p>
                        )}
                        <h1 className="mt-2 font-display text-[40px] font-normal leading-[1.05] text-tinta sm:text-[52px]">{producto.nombre}</h1>
                        <p className="mt-4 text-2xl font-medium text-vino">
                            {variante
                                ? formatPrice(variante.precio)
                                : minPrice != null
                                  ? `${formatPrice(minPrice)}${maxPrice !== minPrice ? ` – ${formatPrice(maxPrice)}` : ''}`
                                  : 'Consultar'}
                        </p>

                        {producto.tags?.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {producto.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="rounded-full bg-rosa px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-vino"
                                    >
                                        {tag.descripcion}
                                    </span>
                                ))}
                            </div>
                        )}

                        {producto.descripcion && (
                            <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-tinta/75">{producto.descripcion}</p>
                        )}

                        {atributos.map((a) => (
                            <div key={a.id} className="mt-7">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-tinta/55">
                                    {a.nombre}
                                    {seleccion[a.id] && (
                                        <span className="ml-2 normal-case tracking-normal text-tinta">
                                            {a.valores.find((v) => v.id === seleccion[a.id])?.valor}
                                        </span>
                                    )}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {a.valores.map((val) => {
                                        const on = seleccion[a.id] === val.id;
                                        const existe = disponible(a.id, val.id);
                                        return a.tipo === 'color' ? (
                                            <button
                                                key={val.id}
                                                type="button"
                                                onClick={() => elegir(a.id, val.id)}
                                                aria-pressed={on}
                                                aria-label={val.valor}
                                                title={val.valor}
                                                className={`h-10 w-10 rounded-full ring-offset-2 transition-all ${
                                                    on ? 'ring-2 ring-vino' : 'ring-1 ring-tinta/15 hover:ring-vino/40'
                                                } ${existe ? '' : 'opacity-40'}`}
                                                style={{ backgroundColor: val.cod_hex || '#e5e0d8' }}
                                            />
                                        ) : (
                                            <button
                                                key={val.id}
                                                type="button"
                                                onClick={() => elegir(a.id, val.id)}
                                                aria-pressed={on}
                                                className={`min-w-[48px] rounded-full border px-4 py-2 text-sm transition-colors ${
                                                    on ? 'border-vino bg-vino text-white' : 'border-tinta/15 text-tinta hover:border-vino'
                                                } ${existe ? '' : 'border-dashed opacity-50'}`}
                                            >
                                                {val.valor}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <dl className="mt-8 divide-y divide-humo border-y border-humo text-sm">
                            <div className="flex justify-between gap-4 py-3">
                                <dt className="text-tinta/55">Disponibilidad</dt>
                                <dd className="flex items-center gap-2">
                                    {variante ? <Availability stock={variante.stock} /> : 'Agotado'}
                                </dd>
                            </div>
                            {variante?.sku && (
                                <div className="flex justify-between gap-4 py-3">
                                    <dt className="text-tinta/55">SKU</dt>
                                    <dd>{variante.sku}</dd>
                                </div>
                            )}
                        </dl>

                        {/* Contact CTA */}
                        <div className="mt-8">
                            <p className="font-display text-[22px] leading-tight">¿Te interesa esta pieza?</p>
                            <p className="mt-1 text-sm text-tinta/60">Escríbenos por WhatsApp y te ayudamos.</p>
                            <div className="mt-4 flex gap-3">
                                {contacto.whatsapp.map((numero) => (
                                    <a
                                        key={numero}
                                        href={whatsappUrl(numero, mensaje)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-vino px-5 text-[15px] font-medium text-white transition-colors hover:bg-vino-deep"
                                    >
                                        <WhatsAppIcon width={18} height={18} />
                                        {numero}
                                    </a>
                                ))}
                                <button
                                    onClick={() => setSaved((s) => !s)}
                                    aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                                    aria-pressed={saved}
                                    className={`grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border transition-colors ${
                                        saved ? 'border-vino bg-vino text-white' : 'border-tinta/15 text-vino hover:border-vino'
                                    }`}
                                >
                                    <HeartIcon filled={saved} width={20} height={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related products */}
                {relacionados?.length > 0 && (
                    <section className="mt-20 border-t border-vino/10 pt-14">
                        <div className="flex items-end justify-between gap-6">
                            <h2 className="font-display text-[40px] font-normal leading-none text-tinta sm:text-[52px]">
                                También <em>te podría</em> gustar
                            </h2>
                            <Link href="/catalogo" className="hidden shrink-0 text-sm text-vino underline underline-offset-4 sm:inline">
                                Ver catálogo
                            </Link>
                        </div>
                        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
                            {relacionados.map((rel) => (
                                <RailCard key={rel.id} producto={rel} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </CatalogoLayout>
    );
}
