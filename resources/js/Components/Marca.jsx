import { usePage } from '@inertiajs/react';
import { MARCA, lineasMarca } from '@/lib/catalogo';

/** Nombre de la tienda tal como lo envía el servidor (Admin → SEO), con un valor por defecto. */
export function useNombreMarca() {
    return usePage().props.marca || MARCA;
}

/**
 * Logo de texto: el nombre de la tienda en dos líneas ("Qué elegancia" / "la de Francia").
 * El tamaño se controla desde `className` (por ejemplo text-[20px]).
 */
export default function Marca({ className = '' }) {
    const nombre = useNombreMarca();
    const lineas = lineasMarca(nombre);

    return (
        <span className={`inline-flex flex-col font-brand leading-[0.92] tracking-[0.02em] ${className}`} aria-label={nombre}>
            {lineas.map((linea) => (
                <span key={linea} aria-hidden="true" className="whitespace-nowrap">{linea}</span>
            ))}
        </span>
    );
}
