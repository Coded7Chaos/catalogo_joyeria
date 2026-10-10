import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';
import StoreImage from '@/Components/Store/StoreImage';
import RailCard from '@/Components/Store/RailCard';
import { ChevronLeft, ChevronRight, HeartIcon, WhatsAppIcon } from '@/Components/Store/Icons';
import { contacto, formatPrice, whatsappUrl } from '@/lib/catalogo';

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

export default function Show({ producto, relacionados }) {
    const variantes = producto.variantes ?? [];
    const images = [...new Set(variantes.map((v) => v.url_foto).filter(Boolean))];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedVariante, setSelectedVariante] = useState(variantes[0]?.id || null);
    const [saved, setSaved] = useState(false);

    const variante = variantes.find((v) => v.id === selectedVariante) ?? null;

    const selectVariante = (v) => {
        const isDeselecting = selectedVariante === v.id;
        setSelectedVariante(isDeselecting ? null : v.id);
        if (!isDeselecting && v.url_foto) {
            const imgIndex = images.indexOf(v.url_foto);
            if (imgIndex !== -1) setCurrentImageIndex(imgIndex);
        }
    };

    const prices = variantes.map((v) => parseFloat(v.precio)).filter((p) => !isNaN(p));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

    const prevImage = () => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    const nextImage = () => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));

    const mensaje = `Hola, me interesa: ${producto.nombre}`;

    return (
        <CatalogoLayout>
            <Head title={producto.nombre} />

            <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-8 lg:pb-24 lg:pt-10">
                {/* Breadcrumb */}
                <nav aria-label="Ruta" className="flex flex-wrap items-center gap-2 text-[13px] uppercase tracking-[0.16em] text-tinta/55">
                    <Link href="/" className="hover:text-vino">
                        Inicio
                    </Link>
                    <span>/</span>
                    <Link href="/catalogo" className="hover:text-vino">
                        Catálogo
                    </Link>
                    {producto.categoria && (
                        <>
                            <span>/</span>
                            <Link href={`/catalogo?id_categoria=${producto.id_categoria}`} className="hover:text-vino">
                                {producto.categoria.categoria}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="truncate text-tinta">{producto.nombre}</span>
                </nav>

                <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
                    {/* Gallery */}
                    <div>
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-rosa">
                            <StoreImage
                                key={images[currentImageIndex] ?? 'sin-foto'}
                                src={images[currentImageIndex]}
                                alt={producto.nombre}
                                className="absolute inset-0 h-full w-full animate-rise object-cover"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        aria-label="Foto anterior"
                                        className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-tinta shadow-md transition hover:bg-vino hover:text-white"
                                    >
                                        <ChevronLeft />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        aria-label="Foto siguiente"
                                        className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-tinta shadow-md transition hover:bg-vino hover:text-white"
                                    >
                                        <ChevronRight />
                                    </button>
                                    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
                                        {images.map((_, i) => (
                                            <span
                                                key={i}
                                                className={`h-2 rounded-full transition-all ${i === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
                                {images.map((src, i) => (
                                    <button
                                        key={src}
                                        onClick={() => setCurrentImageIndex(i)}
                                        aria-label={`Ver foto ${i + 1}`}
                                        className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-[14px] bg-rosa ring-2 transition ${
                                            i === currentImageIndex ? 'ring-vino' : 'ring-transparent hover:ring-vino/30'
                                        }`}
                                    >
                                        <StoreImage src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
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

                        {variantes.length > 0 && (
                            <div className="mt-8">
                                <p className="text-[11px] uppercase tracking-[0.2em] text-tinta/55">Opciones disponibles</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {variantes.map((v) => {
                                        const color = v.colores?.[0];
                                        const selected = v.id === selectedVariante;
                                        return (
                                            <button
                                                key={v.id}
                                                type="button"
                                                onClick={() => selectVariante(v)}
                                                aria-pressed={selected}
                                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                                                    selected ? 'border-vino bg-vino text-white' : 'border-tinta/15 text-tinta hover:border-vino'
                                                }`}
                                            >
                                                {color && (
                                                    <span
                                                        className="h-3.5 w-3.5 rounded-full ring-1 ring-white/60"
                                                        style={{ backgroundColor: color.cod_hex }}
                                                    />
                                                )}
                                                {color?.color ?? 'Estándar'} · Talla {v.talla?.talla ?? 'Única'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <dl className="mt-8 divide-y divide-humo border-y border-humo text-sm">
                            <div className="flex justify-between gap-4 py-3">
                                <dt className="text-tinta/55">Disponibilidad</dt>
                                <dd className="flex items-center gap-2">
                                    {variante ? <Availability stock={variante.stock} /> : 'Elige una opción'}
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
