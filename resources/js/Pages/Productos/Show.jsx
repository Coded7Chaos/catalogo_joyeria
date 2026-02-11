import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';

export default function Show({ producto, relacionados }) {
    const allImages = [
        producto.url_foto,
        ...producto.variantes.map(v => v.url_foto)
    ].filter(img => img !== null && img !== '' && img !== undefined);

    const uniqueImages = [...new Set(allImages)];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedVariante, setSelectedVariante] = useState(null);

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
                                        ${minPrice.toFixed(2)}
                                    </span>
                                    {maxPrice && maxPrice !== minPrice && (
                                        <span className="text-joya-gray text-sm">
                                            — ${maxPrice.toFixed(2)}
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
                                        onClick={() => setSelectedVariante(
                                            selectedVariante === variante.id ? null : variante.id
                                        )}
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
                                                    ${parseFloat(variante.precio).toFixed(2)}
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
                        <div className="bg-joya-cream rounded-lg p-6 text-center">
                            <p className="text-sm text-joya-gray mb-2">¿Te interesa esta pieza?</p>
                            <p className="text-joya-black font-medium">Contáctanos para más información</p>
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
                                                src={rel.url_foto || '/placeholder.jpg'}
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
                                                    {relMinPrice ? `$${relMinPrice.toFixed(2)}` : 'Consultar'}
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
