import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const navItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/admin' },
    { key: 'productos', label: 'Productos', href: '/admin/productos' },
    { key: 'categorias', label: 'Categorias', href: '/admin/categorias' },
    { key: 'tallas', label: 'Tallas', href: '/admin/tallas' },
    { key: 'colores', label: 'Colores', href: '/admin/colores' },
    { key: 'tags', label: 'Tags', href: '/admin/tags' },
    { key: 'proveedores', label: 'Proveedores', href: '/admin/proveedores' },
    { key: 'usuarios', label: 'Usuarios', href: '/admin/usuarios' },
];

export default function AdminLayout({ children, title = 'Admin', active = '' }) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-joya-cream">
            <Head title={`Admin - ${title}`} />

            <header className="bg-joya-black sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-3">
                                <img src="/images/logo.png" alt="Gilded" className="h-10 w-10 object-contain rounded-full" />
                                <span className="text-white text-lg font-bold tracking-wider hidden sm:inline">GILDED</span>
                            </Link>
                            <span className="text-joya-gold text-xs uppercase tracking-widest border border-joya-gold/30 px-2 py-0.5 rounded">Admin</span>
                        </div>

                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`text-xs px-3 py-1.5 rounded transition-colors uppercase tracking-wider ${
                                        active === item.key ? 'text-joya-gold bg-white/5' : 'text-white/60 hover:text-joya-gold'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors hidden sm:inline">Ver tienda</Link>
                            <div className="w-8 h-8 rounded-full bg-joya-gold/20 border border-joya-gold/40 flex items-center justify-center">
                                <span className="text-joya-gold text-xs font-bold">{auth.user?.nombre?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-white/70 hover:text-white">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="lg:hidden border-t border-white/10 px-4 pb-3 pt-2 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`block text-sm px-3 py-2 rounded transition-colors ${
                                    active === item.key ? 'text-joya-gold bg-white/5' : 'text-white/60 hover:text-joya-gold'
                                }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <Link href="/" className="block text-sm px-3 py-2 text-white/40 hover:text-white" onClick={() => setMobileOpen(false)}>
                            Ver tienda
                        </Link>
                    </div>
                )}
            </header>

            {children}
        </div>
    );
}
