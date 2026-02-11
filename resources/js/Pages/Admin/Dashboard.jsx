import { Head, Link, usePage } from '@inertiajs/react';
import AdminLayout from './AdminLayout';

export default function Dashboard({ stats, productosRecientes, usuariosRecientes }) {
    const { auth } = usePage().props;

    const statCards = [
        { label: 'Productos', value: stats.totalProductos, href: '/admin/productos', color: 'bg-joya-gold/10 text-joya-gold', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        )},
        { label: 'Variantes', value: stats.totalVariantes, href: '/admin/productos', color: 'bg-purple-50 text-purple-500', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        )},
        { label: 'Usuarios', value: stats.totalUsuarios, href: '/admin/usuarios', color: 'bg-blue-50 text-blue-500', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        )},
        { label: 'Categorias', value: stats.totalCategorias, href: '/admin/categorias', color: 'bg-emerald-50 text-emerald-500', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
        )},
        { label: 'Tallas', value: stats.totalTallas, href: '/admin/tallas', color: 'bg-orange-50 text-orange-500', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        )},
        { label: 'Colores', value: stats.totalColores, href: '/admin/colores', color: 'bg-pink-50 text-pink-500', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
        )},
        { label: 'Tags', value: stats.totalTags, href: '/admin/tags', color: 'bg-indigo-50 text-indigo-500', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
        )},
        { label: 'Proveedores', value: stats.totalProveedores, href: '/admin/proveedores', color: 'bg-amber-50 text-amber-600', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
        )},
    ];

    const alertCards = [
        { label: 'Variantes agotadas', value: stats.productosAgotados, warning: stats.productosAgotados > 0, href: '/admin/productos' },
        { label: 'Ventas pendientes', value: stats.ventasPendientes, warning: stats.ventasPendientes > 0 },
    ];

    return (
        <AdminLayout title="Dashboard" active="dashboard">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-joya-black">Dashboard</h1>
                    <p className="text-joya-gray text-sm mt-1">Bienvenido al panel de administracion, {auth.user?.nombre}.</p>
                </div>

                {/* Alert Cards */}
                {alertCards.some((a) => a.warning) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {alertCards.filter((a) => a.warning).map((alert) => (
                            <div key={alert.label} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-red-800">{alert.value} {alert.label.toLowerCase()}</p>
                                    {alert.href && <Link href={alert.href} className="text-xs text-red-600 hover:underline">Ver detalle</Link>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                    {statCards.map((card) => (
                        <Link
                            key={card.label}
                            href={card.href}
                            className="bg-white border border-joya-border rounded-lg p-5 hover:border-joya-gold/50 transition-colors group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                                    {card.icon}
                                </div>
                                <svg className="w-4 h-4 text-joya-gray/30 group-hover:text-joya-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                            <p className="text-2xl font-bold text-joya-black">{card.value}</p>
                            <p className="text-xs text-joya-gray mt-0.5">{card.label}</p>
                        </Link>
                    ))}
                </div>

                {/* Recent Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {/* Recent Products */}
                    <div className="bg-white border border-joya-border rounded-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-joya-border">
                            <h2 className="text-sm font-semibold text-joya-black">Productos recientes</h2>
                            <Link href="/admin/productos" className="text-xs text-joya-gold hover:text-joya-gold-hover">Ver todos</Link>
                        </div>
                        <div className="divide-y divide-joya-border">
                            {productosRecientes.length === 0 ? (
                                <p className="text-sm text-joya-gray text-center py-6">Sin productos</p>
                            ) : productosRecientes.map((p) => (
                                <div key={p.id} className="flex items-center gap-3 px-6 py-3">
                                    {p.url_foto ? (
                                        <img src={p.url_foto} alt={p.nombre} className="w-8 h-8 rounded object-cover border border-joya-border flex-shrink-0" />
                                    ) : (
                                        <div className="w-8 h-8 rounded bg-joya-cream border border-joya-border flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-joya-gray/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-joya-black truncate">{p.nombre}</p>
                                        <p className="text-xs text-joya-gray">{p.categoria?.categoria || 'Sin categoria'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="bg-white border border-joya-border rounded-lg">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-joya-border">
                            <h2 className="text-sm font-semibold text-joya-black">Usuarios recientes</h2>
                            <Link href="/admin/usuarios" className="text-xs text-joya-gold hover:text-joya-gold-hover">Ver todos</Link>
                        </div>
                        <div className="divide-y divide-joya-border">
                            {usuariosRecientes.length === 0 ? (
                                <p className="text-sm text-joya-gray text-center py-6">Sin usuarios</p>
                            ) : usuariosRecientes.map((u) => (
                                <div key={u.id} className="flex items-center gap-3 px-6 py-3">
                                    <div className="w-8 h-8 rounded-full bg-joya-gold/10 border border-joya-gold/30 flex items-center justify-center flex-shrink-0">
                                        <span className="text-joya-gold text-xs font-bold">{u.nombre?.charAt(0)?.toUpperCase()}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-joya-black truncate">{u.nombre}</p>
                                        <p className="text-xs text-joya-gray">{u.email}</p>
                                    </div>
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-joya-gold/10 text-joya-gold' : 'bg-gray-100 text-joya-gray'}`}>
                                        {u.role === 'admin' ? 'Admin' : 'Cliente'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-joya-border rounded-lg p-6">
                    <h2 className="text-sm font-semibold text-joya-black mb-4">Acciones rapidas</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/admin/productos" className="inline-flex items-center gap-2 bg-joya-black text-white px-4 py-2 text-sm font-medium hover:bg-joya-dark transition-colors rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Gestionar Productos
                        </Link>
                        <Link href="/admin/categorias" className="inline-flex items-center gap-2 border border-joya-border text-joya-black px-4 py-2 text-sm font-medium hover:border-joya-gold hover:text-joya-gold transition-colors rounded">
                            Categorias
                        </Link>
                        <Link href="/admin/colores" className="inline-flex items-center gap-2 border border-joya-border text-joya-black px-4 py-2 text-sm font-medium hover:border-joya-gold hover:text-joya-gold transition-colors rounded">
                            Colores
                        </Link>
                        <Link href="/admin/tallas" className="inline-flex items-center gap-2 border border-joya-border text-joya-black px-4 py-2 text-sm font-medium hover:border-joya-gold hover:text-joya-gold transition-colors rounded">
                            Tallas
                        </Link>
                        <Link href="/admin/tags" className="inline-flex items-center gap-2 border border-joya-border text-joya-black px-4 py-2 text-sm font-medium hover:border-joya-gold hover:text-joya-gold transition-colors rounded">
                            Tags
                        </Link>
                        <Link href="/admin/proveedores" className="inline-flex items-center gap-2 border border-joya-border text-joya-black px-4 py-2 text-sm font-medium hover:border-joya-gold hover:text-joya-gold transition-colors rounded">
                            Proveedores
                        </Link>
                        <Link href="/" className="inline-flex items-center gap-2 border border-joya-border text-joya-gray px-4 py-2 text-sm font-medium hover:border-joya-gold hover:text-joya-gold transition-colors rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Ver Tienda
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
