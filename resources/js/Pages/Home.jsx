import { useEffect, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';
import CatalogoTablero from '@/Components/Store/CatalogoTablero';
import RailCard from '@/Components/Store/RailCard';
import StoreImage from '@/Components/Store/StoreImage';
import { ChevronLeft, ChevronRight } from '@/Components/Store/Icons';
import { assets, coverFor, findCategoria, stock } from '@/lib/catalogo';

const slides = [
    {
        src: assets.sarah,
        pos: '50% 30%',
        title: (
            <>
                <em>la</em> LUZ <em>en cada</em> DETALLE
            </>
        ),
        copy: 'Piezas que brillan contigo, del día a la noche.',
        cta: 'Ver collares',
        target: 'Collares',
    },
    {
        src: stock.modelNecklace,
        pos: '50% 25%',
        title: (
            <>
                <em>el</em> ORO <em>que</em> TE NOMBRA
            </>
        ),
        copy: 'Un poco de brillo llega muy lejos cuando la pieza es la correcta.',
        cta: 'Ver pendientes',
        target: 'Pendientes',
    },
    {
        src: assets.handy,
        pos: '50% 40%',
        title: (
            <>
                SOY PRIORIDAD, <em>no opción</em>
            </>
        ),
        copy: 'Anillos y pulseras para regalarte, sin pedir permiso.',
        cta: 'Ver anillos',
        target: 'Anillos',
    },
];

const lookbook = [
    { title: 'Brillo Sereno', src: assets.stefan, pos: '50% 35%' },
    { title: 'Declaración Suave', src: stock.modelNecklace, pos: '50% 20%' },
    { title: 'Teoría del Brillo', src: assets.sarah, pos: '50% 30%' },
    { title: 'Pequeños Lujos', src: assets.handy, pos: '50% 50%' },
];

const ventajas = [
    {
        title: 'Calidad Premium',
        copy: 'Cada pieza es seleccionada cuidadosamente para garantizar los más altos estándares de calidad.',
    },
    {
        title: 'Envío Seguro',
        copy: 'Tu joyería llega protegida con empaque especial. Seguimiento en tiempo real de tu pedido.',
    },
    {
        title: 'Atención Personalizada',
        copy: 'Nuestro equipo te asesora para encontrar la pieza perfecta para cada ocasión especial.',
    },
];

const scrollToCatalog = () => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });

export default function Home({ categorias, novedades, totalProductos, productos, colores, tallas, tags, rangoPrecio, filtros }) {
    const [slide, setSlide] = useState(0);
    const railRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setSlide((s) => (s + 1) % slides.length), 6500);
        return () => clearTimeout(t);
    }, [slide]);

    // Opens the board filtered by a category (the board reads its filters from the URL).
    const verCategoria = (categoria) => {
        if (!categoria) return scrollToCatalog();
        router.get('/', { id_categoria: categoria.id }, { onSuccess: scrollToCatalog });
    };

    const scrollRail = (dir) => {
        const el = railRef.current;
        if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
    };

    return (
        <CatalogoLayout transparentHeader>
            <Head title="Inicio" />

            {/* Hero */}
            <section className="relative h-[88svh] min-h-[560px] overflow-hidden bg-vino-deep text-white lg:h-[92svh]">
                {slides.map((s, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 transition-opacity duration-[1200ms] ${i === slide ? 'opacity-100' : 'opacity-0'}`}
                        aria-hidden={i !== slide}
                    >
                        <StoreImage
                            src={s.src}
                            alt=""
                            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[7000ms] ease-out ${
                                i === slide ? 'scale-105' : 'scale-100'
                            }`}
                            style={{ objectPosition: s.pos }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-vino-deep/55 via-vino-deep/20 to-vino-deep/70" />
                    </div>
                ))}
                <div key={slide} className="relative mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 pt-16 text-center">
                    <h1 className="animate-rise font-display text-[46px] font-light leading-[0.98] sm:text-[68px] lg:text-[88px] [&_em]:font-light [&_em]:normal-case">
                        {slides[slide].title}
                    </h1>
                    <p className="mt-5 max-w-md animate-rise text-lg text-white/85 [animation-delay:150ms] sm:text-xl">
                        {slides[slide].copy}
                    </p>
                    <div className="mt-9 flex animate-rise flex-wrap items-center justify-center gap-4 [animation-delay:300ms]">
                        <button
                            onClick={() => verCategoria(findCategoria(categorias, slides[slide].target))}
                            className="bg-white px-9 py-4 text-[16px] font-semibold text-tinta transition-colors hover:bg-champan hover:text-white"
                        >
                            {slides[slide].cta}
                        </button>
                        {totalProductos > 0 && (
                            <span className="rounded-full border border-white/40 px-5 py-3 text-sm text-white/85">
                                {totalProductos}+ piezas disponibles
                            </span>
                        )}
                    </div>
                </div>
                <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-4">
                    {slides.map((_, i) => (
                        <button key={i} aria-label={`Diapositiva ${i + 1}`} onClick={() => setSlide(i)} className="grid h-6 w-6 place-items-center">
                            {i === slide ? (
                                <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90">
                                    <circle cx="11" cy="11" r="9" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
                                    <circle
                                        key={slide}
                                        cx="11"
                                        cy="11"
                                        r="9"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="3"
                                        strokeDasharray="63"
                                        style={{ animation: 'dot-fill 6.5s linear forwards' }}
                                    />
                                </svg>
                            ) : (
                                <span className="h-2.5 w-2.5 rounded-full bg-white/50" />
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Shop by collection */}
            {categorias.length > 0 && (
                <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:py-24">
                    <p className="text-center text-[13px] font-medium uppercase tracking-[0.22em] text-tinta/70">Comprar por colección</p>
                    <div className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-10 lg:gap-x-6">
                        {categorias.map((c) => {
                            const cover = coverFor(c.categoria);
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => verCategoria(c)}
                                    className="group basis-[calc(50%-0.5rem)] text-center sm:basis-[calc(33.333%-0.7rem)] lg:basis-[calc(20%-1.2rem)]"
                                >
                                    <div className="relative aspect-square overflow-hidden rounded-full bg-rosa">
                                        {cover ? (
                                            <img
                                                src={cover}
                                                alt={c.categoria}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <span className="grid h-full w-full place-items-center font-display text-[64px] italic text-vino/40 transition-transform duration-700 group-hover:scale-110">
                                                {c.categoria.charAt(0)}
                                            </span>
                                        )}
                                        <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-vino/10" />
                                    </div>
                                    <p className="mt-5 font-display text-[28px] leading-none text-tinta transition-colors group-hover:text-vino sm:text-[32px]">
                                        {c.categoria}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Why Gilded (band from the design) */}
            <section className="relative overflow-hidden text-white">
                <img alt="" src={assets.heroSection} className="absolute inset-0 block h-full w-full max-w-none object-cover" />
                <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-3 lg:py-20">
                    {ventajas.map((v) => (
                        <div key={v.title}>
                            <p className="font-display text-[30px] font-light leading-[1.05] sm:text-[36px]">{v.title}</p>
                            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/75">{v.copy}</p>
                        </div>
                    ))}
                </div>
            </section>

            <CatalogoTablero
                baseUrl="/"
                productos={productos}
                categorias={categorias}
                colores={colores}
                tallas={tallas}
                tags={tags}
                rangoPrecio={rangoPrecio}
                filtros={filtros}
                showEditorial
            />

            {/* New arrivals */}
            {novedades?.length > 0 && (
                <section className="mx-auto max-w-[1440px] py-16 lg:py-24">
                    <div className="flex items-end justify-between gap-6 px-5 sm:px-8">
                        <div className="max-w-xl">
                            <h2 className="font-display text-[46px] font-normal leading-none text-tinta sm:text-[60px]">
                                Nuevo <em>para</em> Amar
                            </h2>
                            <p className="mt-4 text-lg leading-relaxed text-tinta/80">
                                Piezas que tomarás sin pensarlo: fáciles, refinadas y especiales. Recién llegadas, listas para ser tus
                                favoritas.
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center">
                            <button aria-label="Anterior" onClick={() => scrollRail(-1)} className="p-2 text-tinta/50 hover:text-tinta">
                                <ChevronLeft width={28} height={28} />
                            </button>
                            <span className="h-12 w-px bg-tinta/15" />
                            <button aria-label="Siguiente" onClick={() => scrollRail(1)} className="p-2 text-tinta hover:text-vino">
                                <ChevronRight width={28} height={28} />
                            </button>
                        </div>
                    </div>
                    <div ref={railRef} className="no-scrollbar mt-10 flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 sm:scroll-px-8 sm:px-8">
                        {novedades.map((p) => (
                            <RailCard
                                key={p.id}
                                producto={p}
                                badge="Nuevo"
                                className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[calc((100%-60px)/4)]"
                            />
                        ))}
                    </div>
                    <div className="mt-12 flex justify-center">
                        <Link
                            href="/catalogo"
                            className="border border-tinta/25 px-11 py-5 text-[17px] font-semibold text-tinta transition-colors hover:border-vino hover:bg-vino hover:text-white"
                        >
                            Enamórate
                        </Link>
                    </div>
                </section>
            )}

            {/* Lookbook */}
            <section className="mx-auto grid max-w-[1440px] gap-5 px-5 pb-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:pb-24">
                {lookbook.map((l) => (
                    <a key={l.title} href="#catalogo" className="group relative block aspect-square overflow-hidden sm:aspect-[3/4]">
                        <StoreImage
                            src={l.src}
                            alt={l.title}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                            style={{ objectPosition: l.pos }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
                        <h3 className="absolute left-5 top-4 font-display text-[34px] font-normal leading-none text-white">{l.title}</h3>
                        <span className="absolute bottom-5 right-5 rounded-full bg-white/0 px-4 py-2 text-sm text-white ring-1 ring-white/70 transition-colors group-hover:bg-white group-hover:text-vino">
                            Descubrir
                        </span>
                    </a>
                ))}
            </section>

            {/* Closing call to action */}
            <section className="grid lg:grid-cols-2">
                <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[720px]">
                    <img
                        src={stock.modelNecklace}
                        alt="Modelo con collares dorados"
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover object-top"
                    />
                </div>
                <div className="relative flex flex-col items-center justify-center overflow-hidden bg-humo px-6 py-16 text-center">
                    <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-vino-soft">¿Lista para brillar?</p>
                    <h2 className="mt-3 font-display text-[44px] font-normal uppercase leading-[1.02] text-tinta sm:text-[60px]">
                        Encuentra la pieza
                        <br />
                        <em className="normal-case">que te define</em>
                    </h2>
                    <div className="relative mt-12 h-[260px] w-[300px] sm:h-[300px] sm:w-[360px]">
                        <img
                            src={assets.sarah}
                            alt=""
                            loading="lazy"
                            className="absolute left-0 top-0 h-[200px] w-[150px] -rotate-12 object-cover shadow-xl sm:h-[230px] sm:w-[175px]"
                        />
                        <img
                            src={stock.pearlSet}
                            alt=""
                            loading="lazy"
                            className="absolute bottom-0 right-0 h-[170px] w-[170px] rotate-6 object-cover shadow-xl sm:h-[200px] sm:w-[200px]"
                        />
                        <StoreImage
                            src={assets.handy}
                            alt=""
                            loading="lazy"
                            className="absolute left-[90px] top-12 h-[190px] w-[140px] object-cover shadow-2xl sm:left-[110px]"
                        />
                    </div>
                    <Link
                        href="/catalogo"
                        className="mt-12 bg-vino px-9 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-vino-deep"
                    >
                        Ver catálogo
                    </Link>
                </div>
            </section>
        </CatalogoLayout>
    );
}
