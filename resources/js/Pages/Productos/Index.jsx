import { Link } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';
import CatalogoTablero from '@/Components/Store/CatalogoTablero';
import Seo from '@/Components/Store/Seo';
import { categoriaUrl } from '@/lib/catalogo';

/** Full catalog (/catalogo) and each category's page (/categoria/{slug}). */
export default function Index({ productos, atributos, tags, rangoPrecio, filtros, categoria, seo }) {
    const ruta = categoria?.ruta ?? [];

    return (
        <CatalogoLayout>
            <Seo seo={seo} />

            {categoria && (
                <nav aria-label="Ruta" className="bg-rosa">
                    <ol className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-5 pt-8 text-[13px] uppercase tracking-[0.16em] text-tinta/55 sm:px-8">
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
                        {ruta.map((c, i) => (
                            <li key={c.id} className="flex items-center gap-2">
                                <span aria-hidden="true">/</span>
                                {i === ruta.length - 1 ? (
                                    <span aria-current="page" className="text-tinta">
                                        {c.categoria}
                                    </span>
                                ) : (
                                    <Link href={categoriaUrl(c)} className="hover:text-vino">
                                        {c.categoria}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            )}

            <CatalogoTablero
                baseUrl={categoria ? categoriaUrl(categoria) : '/catalogo'}
                productos={productos}
                atributos={atributos}
                tags={tags}
                rangoPrecio={rangoPrecio}
                filtros={filtros}
                categoria={categoria}
                title="Catálogo"
            />
        </CatalogoLayout>
    );
}
