import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from './Icons';

/** Laravel paginator links styled as the design's pills. */
export default function Pagination({ links, only, onSuccess, className = '' }) {
    // Only "previous", one page and "next": nothing to paginate.
    if (!links || links.length <= 3) return null;

    return (
        <nav aria-label="Paginación" className={`flex flex-wrap justify-center gap-2 ${className}`}>
            {links.map((link, i) => {
                const isPrev = i === 0;
                const isNext = i === links.length - 1;
                const label = isPrev ? <ChevronLeft width={18} height={18} /> : isNext ? <ChevronRight width={18} height={18} /> : link.label;
                const classes = `grid h-10 min-w-[40px] place-items-center rounded-full px-3 text-sm transition-colors ${
                    link.active ? 'bg-vino text-white' : 'bg-white text-tinta hover:bg-rosa-deep'
                }`;

                if (!link.url) {
                    return (
                        <span key={i} className={`${classes} opacity-40`} aria-hidden="true">
                            {label}
                        </span>
                    );
                }
                return (
                    <Link
                        key={i}
                        href={link.url}
                        preserveScroll
                        only={only}
                        onSuccess={onSuccess}
                        aria-label={isPrev ? 'Página anterior' : isNext ? 'Página siguiente' : undefined}
                        aria-current={link.active ? 'page' : undefined}
                        className={classes}
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
