import { Head } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';
import CatalogoTablero from '@/Components/Store/CatalogoTablero';

export default function Index({ productos, categorias, colores, tallas, tags, rangoPrecio, filtros }) {
    return (
        <CatalogoLayout>
            <Head title="Catálogo" />

            <CatalogoTablero
                baseUrl="/catalogo"
                productos={productos}
                categorias={categorias}
                colores={colores}
                tallas={tallas}
                tags={tags}
                rangoPrecio={rangoPrecio}
                filtros={filtros}
                title="Catálogo"
            />
        </CatalogoLayout>
    );
}
