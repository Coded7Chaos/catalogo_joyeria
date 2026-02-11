import { Head, Link } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';

const ProductCard = ({ producto }) => {
    const allColors = producto.variantes.flatMap(v => v.colores || []);
    const uniqueColors = [...new Map(allColors.map(c => [c.cod_hex, c])).values()];
    const prices = producto.variantes.map(v => parseFloat(v.precio)).filter(p => !isNaN(p));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

    return (
        <Link
            href={`/catalogo/${producto.id}`}
            className="group bg-white border border-joya-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
        >
            <div className="aspect-square overflow-hidden bg-joya-cream">
                <img
                    src={producto.url_foto || '/placeholder.jpg'}
                    alt={producto.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-joya-black text-sm leading-tight mb-2 line-clamp-2">
                    {producto.nombre}
                </h3>
                <div className="flex items-center gap-1.5 mb-3">
                    {uniqueColors.slice(0, 4).map(color => (
                        <div
                            key={color.id}
                            className="w-3.5 h-3.5 rounded-full border border-joya-border"
                            style={{ backgroundColor: color.cod_hex }}
                            title={color.color}
                        />
                    ))}
                    {uniqueColors.length > 4 && (
                        <span className="text-xs text-joya-gray">+{uniqueColors.length - 4}</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-joya-black font-bold">
                        {minPrice ? `$${minPrice.toFixed(2)}` : 'Consultar'}
                    </span>
                    <span className="text-joya-gold text-xs font-medium group-hover:translate-x-1 transition-transform">
                        Ver más →
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default function Home({ categorias, novedades, totalProductos }) {
    return (
        <CatalogoLayout>
            <Head title="Inicio" />

            {/* Hero Section */}
            <section className="relative bg-joya-black overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-30"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1515562141589-67f0d4da0001?w=1920&q=80')"
                    }}
                />
                <div className="absolute inset-0 bg-joya-black/60" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
                    <div className="max-w-2xl">
                        <p className="text-joya-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">
                            Colección Exclusiva
                        </p>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            Elegancia que<br />
                            <span className="text-joya-gold">define tu estilo</span>
                        </h1>
                        <p className="text-white/60 text-lg mb-10 max-w-lg leading-relaxed">
                            Descubre piezas únicas de joyería artesanal. Cada detalle cuenta una historia de sofisticación y buen gusto.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/catalogo"
                                className="inline-flex items-center px-8 py-3.5 bg-joya-gold text-joya-black font-semibold text-sm uppercase tracking-wider hover:bg-joya-gold-hover transition-colors"
                            >
                                Explorar Colección
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <span className="inline-flex items-center px-6 py-3.5 border border-white/20 text-white/60 text-sm">
                                {totalProductos}+ productos disponibles
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categorías */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <p className="text-joya-gold text-sm uppercase tracking-[0.2em] mb-2 font-medium">Explora</p>
                    <h2 className="text-3xl font-bold text-joya-black">Nuestras Categorías</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categorias.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/catalogo?id_categoria=${cat.id}`}
                            className="group relative bg-white border border-joya-border rounded-lg p-8 text-center hover:border-joya-gold transition-all duration-300"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-joya-cream flex items-center justify-center group-hover:bg-joya-gold/10 transition-colors">
                                <svg className="w-7 h-7 text-joya-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-joya-black group-hover:text-joya-gold transition-colors">
                                {cat.categoria}
                            </h3>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Novedades */}
            {novedades && novedades.length > 0 && (
                <section className="bg-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <p className="text-joya-gold text-sm uppercase tracking-[0.2em] mb-2 font-medium">Lo nuevo</p>
                                <h2 className="text-3xl font-bold text-joya-black">Recién Llegados</h2>
                            </div>
                            <Link
                                href="/catalogo"
                                className="hidden sm:inline-flex items-center text-joya-gold text-sm font-medium hover:text-joya-gold-hover transition-colors"
                            >
                                Ver todo
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {novedades.map((producto) => (
                                <ProductCard key={producto.id} producto={producto} />
                            ))}
                        </div>

                        <div className="mt-8 text-center sm:hidden">
                            <Link
                                href="/catalogo"
                                className="inline-flex items-center text-joya-gold text-sm font-medium"
                            >
                                Ver todo el catálogo →
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Propuesta de Valor */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-8">
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-joya-gold/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-joya-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-joya-black text-lg mb-2">Calidad Premium</h3>
                        <p className="text-joya-gray text-sm leading-relaxed">
                            Cada pieza es seleccionada cuidadosamente para garantizar los más altos estándares de calidad.
                        </p>
                    </div>

                    <div className="text-center p-8">
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-joya-gold/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-joya-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-joya-black text-lg mb-2">Envío Seguro</h3>
                        <p className="text-joya-gray text-sm leading-relaxed">
                            Tu joyería llega protegida con empaque especial. Seguimiento en tiempo real de tu pedido.
                        </p>
                    </div>

                    <div className="text-center p-8">
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-joya-gold/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-joya-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-joya-black text-lg mb-2">Atención Personalizada</h3>
                        <p className="text-joya-gray text-sm leading-relaxed">
                            Nuestro equipo te asesora para encontrar la pieza perfecta para cada ocasión especial.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="bg-joya-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <p className="text-joya-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">
                        ¿Lista para brillar?
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        Encuentra la pieza que te define
                    </h2>
                    <p className="text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
                        Explora nuestra colección completa y encuentra joyería que habla de quién eres.
                    </p>
                    <Link
                        href="/catalogo"
                        className="inline-flex items-center px-10 py-4 bg-joya-gold text-joya-black font-semibold text-sm uppercase tracking-wider hover:bg-joya-gold-hover transition-colors"
                    >
                        Explorar Catálogo
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </section>
        </CatalogoLayout>
    );
}
