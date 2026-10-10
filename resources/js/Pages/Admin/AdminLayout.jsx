import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const navItems = [
    { key: 'dashboard', label: 'Dashboard', href: '/admin' },
    { key: 'productos', label: 'Productos', href: '/admin/productos' },
    { key: 'categorias', label: 'Categorias', href: '/admin/categorias' },
    { key: 'atributos', label: 'Atributos', href: '/admin/atributos' },
    { key: 'tags', label: 'Tags', href: '/admin/tags' },
    { key: 'proveedores', label: 'Proveedores', href: '/admin/proveedores' },
    { key: 'usuarios', label: 'Usuarios', href: '/admin/usuarios' },
    { key: 'seo', label: 'SEO', href: '/admin/seo' },
];

export default function AdminLayout({ children, title = 'Admin', active = '' }) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-humo text-tinta">
            <Head title={`Admin - ${title}`} />

            <header className="sticky top-0 z-50 bg-vino-deep text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="flex items-center gap-3">
                                <img src="/images/logo-192.webp" alt="Gilded" className="h-10 w-10 object-contain rounded-full" />
                                <span className="hidden whitespace-nowrap font-brand text-[26px] leading-none tracking-[0.06em] sm:inline">GILDED</span>
                            </Link>
                            <span className="rounded-full border border-champan/40 px-2.5 py-0.5 text-[11px] uppercase tracking-[0.2em] text-champan">Admin</span>
                        </div>

                        <nav className="hidden lg:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    className={`rounded-full px-3.5 py-1.5 text-[12px] uppercase tracking-[0.12em] transition-colors ${
                                        active === item.key ? 'bg-white text-vino' : 'text-white/70 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            <Link href="/" className="hidden whitespace-nowrap rounded-full border border-white/30 px-3.5 py-1.5 text-[12px] uppercase tracking-[0.12em] text-white/80 transition-colors hover:bg-white hover:text-vino sm:inline">Ver tienda</Link>
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-rosa">
                                <span className="text-sm font-medium text-vino">{auth.user?.nombre?.charAt(0)?.toUpperCase()}</span>
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
                                className={`block rounded-full px-4 py-2 text-sm transition-colors ${
                                    active === item.key ? 'bg-white text-vino' : 'text-white/70 hover:bg-white/10 hover:text-white'
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
