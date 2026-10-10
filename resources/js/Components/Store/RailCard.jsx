import { Link } from '@inertiajs/react';
import StoreImage from './StoreImage';
import { EyeIcon } from './Icons';
import { coloresDe, fotoDe, precioDe, productoUrl } from '@/lib/catalogo';

/** Product card from the "Nuevo para Amar" rail of the design. */
export default function RailCard({ producto, badge, className = '' }) {
    const href = productoUrl(producto);
    const colores = coloresDe(producto).slice(0, 6);

    return (
        <article className={`group ${className}`}>
            <Link href={href} className="relative block aspect-[4/5] w-full overflow-hidden bg-humo" aria-label={producto.nombre}>
                <StoreImage
                    src={fotoDe(producto)}
                    alt={producto.nombre}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full max-w-none object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-vino backdrop-blur sm:text-[11px]">
                        {badge}
                    </span>
                )}
                <span className="absolute bottom-2 right-2 grid h-14 w-14 place-items-center bg-tinta text-white transition-colors group-hover:bg-vino">
                    <EyeIcon width={26} height={26} />
                </span>
            </Link>
            <h3 className="mt-4 text-[19px] font-medium leading-snug text-tinta">
                <Link href={href} className="hover:text-vino">
                    {producto.nombre}
                </Link>
            </h3>
            <p className="mt-1 text-[19px] font-medium text-vino">{precioDe(producto)}</p>
            {colores.length > 0 && (
                <div className="mt-2 flex gap-1.5">
                    {colores.map((c) => (
                        <span
                            key={c.id}
                            title={c.color}
                            className="h-3.5 w-3.5 rounded-full ring-1 ring-tinta/10"
                            style={{ backgroundColor: c.cod_hex }}
                        />
                    ))}
                </div>
            )}
        </article>
    );
}
