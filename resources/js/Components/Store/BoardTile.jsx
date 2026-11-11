import { Link } from '@inertiajs/react';
import StoreImage from './StoreImage';
import { ArrowUpRight, HeartIcon } from './Icons';
import { coloresDe, fotoDe, precioDe, productoUrl } from '@/lib/catalogo';

export function ProductTile({ producto, categoria, active, saved, canHover, onActivate, onSave }) {
    const precio = precioDe(producto);
    const tag = producto.tags?.[0]?.descripcion;
    const colores = coloresDe(producto).slice(0, 6);

    const handleClick = (e) => {
        // Desktop: click opens the piece. Touch: first tap reveals the price, second opens it.
        if (!canHover && !active) {
            e.preventDefault();
            onActivate(producto.id);
        }
    };

    return (
        <article
            className="group relative inline-block w-full break-inside-avoid overflow-hidden rounded-[18px] bg-rosa-deep align-top"
        >
            <Link
                href={productoUrl(producto)}
                onClick={handleClick}
                aria-label={`${producto.nombre}, ${precio}`}
                className="relative block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vino"
            >
                <StoreImage
                    src={fotoDe(producto)}
                    alt={producto.nombre}
                    loading="lazy"
                    decoding="async"
                    natural
                />

                {tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-vino backdrop-blur sm:text-[11px]">
                        {tag}
                    </span>
                )}

                <div
                    className={`pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-vino-deep/90 via-vino-deep/35 to-transparent p-3 text-white transition-opacity duration-300 sm:p-4 ${
                        active ? 'opacity-100' : 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
                    }`}
                >
                    <div
                        className={`transition-transform duration-500 ease-out ${
                            active ? 'translate-y-0' : 'translate-y-3 group-hover:translate-y-0'
                        }`}
                    >
                        {categoria && (
                            <p className="text-[10px] uppercase tracking-[0.18em] text-champan sm:text-[11px]">{categoria}</p>
                        )}
                        <h3 className="mt-1 font-display text-[19px] leading-[1.1] sm:text-[22px]">{producto.nombre}</h3>
                        <div className="mt-2 flex items-end justify-between gap-2">
                            <p className="text-[15px] font-medium sm:text-base">{precio}</p>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-vino sm:text-xs">
                                Ver pieza <ArrowUpRight width={13} height={13} />
                            </span>
                        </div>
                        {colores.length > 0 && (
                            <div className="mt-2 hidden gap-1.5 sm:flex">
                                {colores.map((c) => (
                                    <span
                                        key={c.id}
                                        title={c.color}
                                        className="h-3 w-3 rounded-full ring-1 ring-white/70"
                                        style={{ backgroundColor: c.cod_hex }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Link>

            <button
                type="button"
                aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                aria-pressed={saved}
                onClick={() => onSave(producto.id)}
                className={`absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full transition-all duration-300 ${
                    saved
                        ? 'bg-vino text-white opacity-100'
                        : `bg-white text-vino hover:bg-vino hover:text-white focus-visible:opacity-100 ${
                              active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`
                }`}
            >
                <HeartIcon filled={saved} />
            </button>
        </article>
    );
}

export function EditorialTile({ kind, ratio }) {
    const wide = kind === 'temporada';
    const compact = kind === 'soy-prioridad';
    const colors = kind === 'good-things' ? 'bg-champan text-vino-deep' : wide ? 'bg-vino text-white' : 'bg-marino text-white';
    return (
        <div
            className={`relative flex w-full flex-col justify-center overflow-hidden rounded-[18px] ${compact ? 'p-3 sm:p-5' : 'p-5 sm:p-7'} ${colors}`}
            style={{ aspectRatio: ratio }}
        >
            <span aria-hidden="true" className={`mb-5 font-display text-3xl opacity-50 ${compact ? 'hidden' : wide ? 'hidden sm:block' : ''}`}>✶</span>
            <p className={`font-display leading-[1.08] ${compact ? 'text-[clamp(20px,2.5vw,36px)]' : 'text-[clamp(25px,3vw,44px)]'}`}>
                {kind === 'good-things' ? <>Pequeños detalles,<br /><em>grandes sonrisas.</em></> : wide ? <>Un poquito de color.<br /><em>Mucho de ti.</em></> : <>Qué bonito<br />es <em>elegirte.</em></>}
            </p>
        </div>
    );
}
