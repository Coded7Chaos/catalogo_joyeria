import { Link, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

export default function CatalogoLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { url, props } = usePage();
    const user = props.auth?.user;
    const userMenuRef = useRef(null);

    const navLinks = [
        { name: 'Inicio', href: '/' },
        { name: 'Catálogo', href: '/catalogo' },
    ];

    const isActive = (href) => {
        if (href === '/') return url === '/' || url.startsWith('/?');
        return url.startsWith(href);
    };

    useEffect(() => {
        const handleClick = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-joya-cream flex flex-col">
            {/* Navbar */}
            <header className="bg-joya-black sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/images/logo.png" alt="Gilded" className="h-10 w-10 object-contain rounded-full" />
                            <div className="hidden sm:flex flex-col leading-none">
                                <span className="text-joya-gold text-[10px] uppercase tracking-[0.25em]">Joyería</span>
                                <span className="text-white text-lg font-bold tracking-wider">GILDED</span>
                            </div>
                            <span className="sm:hidden text-white text-lg font-bold tracking-wider">GILDED</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm uppercase tracking-wider transition-colors ${
                                        isActive(link.href) ? 'text-joya-gold' : 'text-white/70 hover:text-joya-gold'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Right side: Auth */}
                        <div className="flex items-center gap-4">
                            {user ? (
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 text-white/70 hover:text-joya-gold transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-joya-gold/20 border border-joya-gold/40 flex items-center justify-center">
                                            <span className="text-joya-gold text-xs font-bold">
                                                {user.nombre?.charAt(0)?.toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="hidden md:block text-sm">{user.nombre}</span>
                                        <svg className="w-4 h-4 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white border border-joya-border rounded-lg shadow-lg py-2 z-50">
                                            <div className="px-4 py-2 border-b border-joya-border">
                                                <p className="text-sm font-medium text-joya-black truncate">{user.nombre}</p>
                                                <p className="text-xs text-joya-gray truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                href="/mi-cuenta"
                                                className="block px-4 py-2 text-sm text-joya-gray hover:text-joya-black hover:bg-joya-cream transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                Mi Cuenta
                                            </Link>
                                            {user.role === 'admin' && (
                                                <Link
                                                    href="/admin"
                                                    className="block px-4 py-2 text-sm text-joya-gold hover:bg-joya-cream transition-colors font-medium"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    Panel Admin
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden md:flex items-center gap-3">
                                    <Link
                                        href="/login"
                                        className="text-sm text-white/70 hover:text-joya-gold transition-colors"
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="text-sm bg-joya-gold text-joya-black px-4 py-1.5 font-medium hover:bg-joya-gold-hover transition-colors"
                                    >
                                        Crear Cuenta
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden text-white p-2"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-white/10 pb-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block py-3 text-sm uppercase tracking-wider ${
                                        isActive(link.href) ? 'text-joya-gold' : 'text-white/70'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {!user && (
                                <div className="border-t border-white/10 mt-2 pt-3 space-y-2">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-white/70">
                                        Iniciar Sesión
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-joya-gold font-medium">
                                        Crear Cuenta
                                    </Link>
                                </div>
                            )}
                            {user && (
                                <div className="border-t border-white/10 mt-2 pt-3 space-y-2">
                                    <Link href="/mi-cuenta" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-white/70">
                                        Mi Cuenta
                                    </Link>
                                    {user.role === 'admin' && (
                                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-joya-gold font-medium">
                                            Panel Admin
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="block py-2 text-sm text-red-400">
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-joya-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Brand */}
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-3 mb-4">
                                <img src="/images/logo.png" alt="Gilded" className="h-12 w-12 object-contain rounded-full" />
                                <div>
                                    <span className="text-joya-gold text-[10px] uppercase tracking-[0.25em] block">Joyería</span>
                                    <span className="text-white text-xl font-bold tracking-wider">GILDED</span>
                                </div>
                            </div>
                            <p className="text-white/50 text-sm leading-relaxed">
                                Joyería exclusiva con diseños únicos que reflejan tu estilo personal. Calidad premium en cada pieza.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="text-joya-gold text-sm uppercase tracking-wider font-semibold mb-4">Navegación</h4>
                            <ul className="space-y-3">
                                <li><Link href="/" className="text-white/50 hover:text-joya-gold text-sm transition-colors">Inicio</Link></li>
                                <li><Link href="/catalogo" className="text-white/50 hover:text-joya-gold text-sm transition-colors">Catálogo</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-joya-gold text-sm uppercase tracking-wider font-semibold mb-4">Contacto</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-white/50 text-sm">
                                    <svg className="w-4 h-4 text-joya-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    contacto@gilded.com
                                </li>
                                <li className="flex items-center gap-3 text-white/50 text-sm">
                                    <svg className="w-4 h-4 text-joya-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    +58 412 000 0000
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 mt-12 pt-8 text-center">
                        <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} Joyería Gilded. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
