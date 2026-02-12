import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';

export default function Show({ producto, relacionados }) {
    const allImages = producto.variantes
        .map(v => v.url_foto)
        .filter(img => img !== null && img !== '' && img !== undefined);

    const uniqueImages = [...new Set(allImages)];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedVariante, setSelectedVariante] = useState(producto.variantes[0]?.id || null);

    const selectVariante = (variante) => {
        const isDeselecting = selectedVariante === variante.id;
        setSelectedVariante(isDeselecting ? null : variante.id);
        if (!isDeselecting && variante.url_foto) {
            const imgIndex = uniqueImages.indexOf(variante.url_foto);
            if (imgIndex !== -1) setCurrentImageIndex(imgIndex);
        }
    };

    const prices = producto.variantes.map(v => parseFloat(v.precio)).filter(p => !isNaN(p));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

    return (
        <CatalogoLayout>
            <Head title={producto.nombre} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center text-sm mb-8">
                    <Link href="/" className="text-joya-gray hover:text-joya-gold transition-colors">
                        Inicio
                    </Link>
                    <svg className="w-4 h-4 text-joya-border mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <Link href="/catalogo" className="text-joya-gray hover:text-joya-gold transition-colors">
                        Catálogo
                    </Link>
                    <svg className="w-4 h-4 text-joya-border mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-joya-black font-medium truncate">{producto.nombre}</span>
                </nav>

                {/* Product Detail */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Image Gallery */}
                    <div>
                        {/* Main Image */}
                        <div className="aspect-square bg-white border border-joya-border rounded-lg overflow-hidden mb-4">
                            <img
                                src={uniqueImages[currentImageIndex] || '/placeholder.jpg'}
                                alt={producto.nombre}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Thumbnails */}
                        {uniqueImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                                {uniqueImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIndex(idx)}
                                        className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                                            idx === currentImageIndex
                                                ? 'border-joya-gold'
                                                : 'border-joya-border hover:border-joya-gray'
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${producto.nombre} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div>
                        {/* Category */}
                        {producto.categoria && (
                            <p className="text-joya-gold text-sm uppercase tracking-wider font-medium mb-2">
                                {producto.categoria.categoria}
                            </p>
                        )}

                        {/* Name */}
                        <h1 className="text-3xl font-bold text-joya-black mb-4">
                            {producto.nombre}
                        </h1>

                        {/* Tags */}
                        {producto.tags && producto.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {producto.tags.map(tag => (
                                    <span
                                        key={tag.id}
                                        className="px-3 py-1 text-xs border border-joya-gold text-joya-gold uppercase tracking-wider font-medium"
                                    >
                                        {tag.descripcion}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Price range */}
                        <div className="border-t border-b border-joya-border py-4 mb-6">
                            {minPrice && (
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-joya-black">
                                        Bs. {minPrice.toFixed(2)}
                                    </span>
                                    {maxPrice && maxPrice !== minPrice && (
                                        <span className="text-joya-gray text-sm">
                                            — Bs. {maxPrice.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Variants */}
                        <div className="mb-8">
                            <h3 className="text-sm uppercase tracking-wider text-joya-gray font-semibold mb-4">
                                Opciones disponibles
                            </h3>
                            <div className="space-y-3">
                                {producto.variantes.map((variante) => (
                                    <button
                                        key={variante.id}
                                        onClick={() => selectVariante(variante)}
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                                            selectedVariante === variante.id
                                                ? 'border-joya-gold bg-joya-gold/5'
                                                : 'border-joya-border hover:border-joya-gold'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Color swatch */}
                                                {variante.colores && variante.colores.length > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-8 h-8 rounded-full border border-joya-border"
                                                            style={{ backgroundColor: variante.colores[0].cod_hex }}
                                                            title={variante.colores[0].color}
                                                        />
                                                        <span className="text-sm text-joya-black font-medium">
                                                            {variante.colores[0].color}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-joya-gray">Estándar</span>
                                                )}

                                                {/* Separator */}
                                                <span className="text-joya-border">|</span>

                                                {/* Talla */}
                                                <span className="text-sm text-joya-gray">
                                                    Talla: <span className="text-joya-black font-medium">{variante.talla?.talla || 'Única'}</span>
                                                </span>
                                            </div>

                                            <div className="text-right">
                                                <p className="font-bold text-joya-black text-lg">
                                                    Bs. {parseFloat(variante.precio).toFixed(2)}
                                                </p>
                                                {variante.stock === 1 && (
                                                    <p className="text-xs text-red-500 font-medium">
                                                        Última unidad
                                                    </p>
                                                )}
                                                {variante.stock > 1 && variante.stock <= 3 && (
                                                    <p className="text-xs text-joya-gold font-medium">
                                                        Quedan {variante.stock}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Contact CTA */}
                        <div className="bg-joya-cream rounded-lg p-6">
                            <p className="text-sm text-joya-gray mb-1 text-center">¿Te interesa esta pieza?</p>
                            <p className="text-joya-black font-medium mb-4 text-center">Contáctanos por WhatsApp</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href={`https://wa.me/59173059904?text=${encodeURIComponent(`Hola, me interesa: ${producto.nombre}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    73059904
                                </a>
                                <a
                                    href={`https://wa.me/59173707000?text=${encodeURIComponent(`Hola, me interesa: ${producto.nombre}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    73707000
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relacionados && relacionados.length > 0 && (
                    <section className="mt-20 border-t border-joya-border pt-12">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <p className="text-joya-gold text-sm uppercase tracking-[0.2em] mb-1 font-medium">Descubre más</p>
                                <h2 className="text-2xl font-bold text-joya-black">
                                    También te podría interesar
                                </h2>
                            </div>
                            <Link
                                href="/catalogo"
                                className="hidden sm:inline-flex items-center text-joya-gold text-sm font-medium hover:text-joya-gold-hover transition-colors"
                            >
                                Ver catálogo
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {relacionados.map((rel) => {
                                const relColors = rel.variantes?.flatMap(v => v.colores || []) || [];
                                const relUniqueColors = [...new Map(relColors.map(c => [c.cod_hex, c])).values()];
                                const relPrices = rel.variantes?.map(v => parseFloat(v.precio)).filter(p => !isNaN(p)) || [];
                                const relMinPrice = relPrices.length > 0 ? Math.min(...relPrices) : null;

                                return (
                                    <Link
                                        key={rel.id}
                                        href={`/catalogo/${rel.id}`}
                                        className="group bg-white border border-joya-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="aspect-square overflow-hidden bg-joya-cream">
                                            <img
                                                src={rel.variantes?.[0]?.url_foto || '/placeholder.jpg'}
                                                alt={rel.nombre}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-joya-black text-sm leading-tight mb-2 line-clamp-2">
                                                {rel.nombre}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mb-2">
                                                {relUniqueColors.slice(0, 3).map(color => (
                                                    <div
                                                        key={color.id}
                                                        className="w-3 h-3 rounded-full border border-joya-border"
                                                        style={{ backgroundColor: color.cod_hex }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-joya-black">
                                                    {relMinPrice ? `Bs. ${relMinPrice.toFixed(2)}` : 'Consultar'}
                                                </span>
                                                <span className="text-joya-gold text-xs font-medium">
                                                    Ver →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </CatalogoLayout>
    );
}
