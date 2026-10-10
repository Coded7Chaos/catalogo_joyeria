import { Link, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    CloseIcon,
    InstagramIcon,
    MailIcon,
    MenuIcon,
    PhoneIcon,
    SearchIcon,
    TikTokIcon,
} from '@/Components/Store/Icons';
import { contacto } from '@/lib/catalogo';

const whatsappHref = `https://wa.me/591${contacto.whatsapp[0]}`;

const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalogo' },
];

const announcements = [
    <>Escríbenos por WhatsApp al {contacto.whatsapp.join(' · ')}</>,
    <>
        Síguenos en{' '}
        <a href={contacto.instagram} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            Instagram
        </a>{' '}
        y{' '}
        <a href={contacto.tiktok} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
            TikTok
        </a>
    </>,
    <>Joyería exclusiva con diseños únicos</>,
];

function Brand({ className = '', logoClassName = 'h-10 w-10' }) {
    return (
        <span className={`flex items-center gap-3 ${className}`}>
            <img src="/images/logo.png" alt="" className={`shrink-0 rounded-full object-contain ${logoClassName}`} />
            <span className="whitespace-nowrap font-brand leading-none tracking-[0.06em]">GILDED</span>
        </span>
    );
}

/**
 * Store chrome from the Figma Make design: announcement bar, header, mobile
 * menu and footer. `transparentHeader` lets the header float over a full-bleed
 * hero until the page scrolls.
 */
export default function CatalogoLayout({ children, transparentHeader = false }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [announce, setAnnounce] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [search, setSearch] = useState('');
    const { url, props } = usePage();
    const user = props.auth?.user;
    const userMenuRef = useRef(null);

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

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setAnnounce((s) => (s + 1) % announcements.length), 5000);
        return () => clearTimeout(t);
    }, [announce]);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const submitSearch = () => {
        const term = search.trim();
        if (!term) return;
        setMobileMenuOpen(false);
        router.get('/catalogo', { search: term });
    };

    const solid = !transparentHeader || scrolled || mobileMenuOpen;

    // Pill search box; `className` sets its size, display and colors for each spot.
    const searchField = (className, inputProps) => (
        <label className={`items-center gap-2.5 rounded-full border px-4 transition-colors ${className}`}>
            <SearchIcon width={18} height={18} className="shrink-0 opacity-70" />
            <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                placeholder="Busca tu look ideal"
                aria-label="Buscar joyas"
                className="w-full min-w-0 border-0 bg-transparent p-0 font-sans text-sm text-current outline-none placeholder:text-current placeholder:opacity-60 focus:ring-0 [&::-webkit-search-cancel-button]:hidden"
                {...inputProps}
            />
            {search && (
                <button
                    type="button"
                    aria-label="Borrar búsqueda"
                    onClick={() => setSearch('')}
                    className="grid h-5 w-5 shrink-0 place-items-center rounded-full opacity-60 transition-opacity hover:opacity-100"
                >
                    <CloseIcon width={14} height={14} />
                </button>
            )}
        </label>
    );

    return (
        <div className="flex min-h-screen flex-col bg-white text-tinta">
            {/* Announcement bar */}
            <div className="relative z-40 flex h-11 items-center bg-vino text-white">
                <button
                    aria-label="Aviso anterior"
                    onClick={() => setAnnounce((a) => (a - 1 + announcements.length) % announcements.length)}
                    className="grid h-full w-12 place-items-center border-r border-white/20"
                >
                    <ChevronLeft width={16} height={16} />
                </button>
                <p key={announce} className="flex-1 animate-rise px-2 text-center text-[13px] sm:text-sm">
                    {announcements[announce]}
                </p>
                <button
                    aria-label="Aviso siguiente"
                    onClick={() => setAnnounce((a) => (a + 1) % announcements.length)}
                    className="grid h-full w-12 place-items-center border-l border-white/20"
                >
                    <ChevronRight width={16} height={16} />
                </button>
            </div>

            {/* Header */}
            <header
                className={`sticky top-0 z-30 transition-colors duration-500 ${transparentHeader ? '-mb-[73px] lg:-mb-[121px]' : ''} ${
                    solid ? 'bg-white text-tinta shadow-[0_1px_0_rgba(83,19,30,0.1)]' : 'bg-transparent text-white'
                }`}
            >
                <div className="mx-auto flex h-[73px] max-w-[1440px] items-center gap-4 px-5 sm:px-8">
                    <button
                        aria-label="Menú"
                        onClick={() => setMobileMenuOpen((m) => !m)}
                        className="-ml-1 p-1 lg:hidden"
                    >
                        {mobileMenuOpen ? <CloseIcon width={26} height={26} /> : <MenuIcon />}
                    </button>
                    <Link href="/" aria-label="Gilded, inicio">
                        <Brand className="text-[26px] sm:text-[34px]" />
                    </Link>

                    <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
                        {searchField(
                            `hidden h-10 w-[260px] md:flex ${
                                solid
                                    ? 'border-tinta/15 bg-white text-tinta focus-within:border-vino focus-within:ring-1 focus-within:ring-vino/25'
                                    : 'border-white/50 bg-white/10 text-white backdrop-blur-sm focus-within:border-white focus-within:bg-white/20'
                            }`,
                        )}
                        <button aria-label="Buscar" className="p-1 md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <SearchIcon />
                        </button>
                        <span className={`hidden h-8 w-px sm:block ${solid ? 'bg-tinta/15' : 'bg-white/40'}`} />

                        {user ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2"
                                    aria-expanded={userMenuOpen}
                                >
                                    <span
                                        className={`grid h-9 w-9 place-items-center rounded-full text-sm font-medium ${
                                            solid ? 'bg-rosa text-vino' : 'bg-white/15 text-white ring-1 ring-white/50'
                                        }`}
                                    >
                                        {user.nombre?.charAt(0)?.toUpperCase()}
                                    </span>
                                    <span className="hidden text-sm md:block">{user.nombre}</span>
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 z-50 mt-3 w-60 animate-rise overflow-hidden rounded-[18px] bg-white py-2 text-tinta shadow-[0_24px_60px_-24px_rgba(83,19,30,0.45)] ring-1 ring-vino/10">
                                        <div className="border-b border-vino/10 px-5 pb-3 pt-2">
                                            <p className="truncate font-display text-lg leading-tight">{user.nombre}</p>
                                            <p className="truncate text-xs text-tinta/55">{user.email}</p>
                                        </div>
                                        <Link
                                            href="/mi-cuenta"
                                            className="block px-5 py-2.5 text-sm hover:bg-rosa"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            Mi cuenta
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link
                                                href="/admin"
                                                className="block px-5 py-2.5 text-sm font-medium text-vino hover:bg-rosa"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                Panel de administración
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-5 py-2.5 text-left text-sm text-tinta/60 hover:bg-rosa hover:text-vino"
                                        >
                                            Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="hidden items-center gap-4 md:flex">
                                <Link href="/login" className="text-sm opacity-80 transition-opacity hover:opacity-100">
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                        solid ? 'bg-vino text-white hover:bg-vino-deep' : 'bg-white text-tinta hover:bg-champan hover:text-white'
                                    }`}
                                >
                                    Crear cuenta
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop nav */}
                <nav className={`hidden border-t lg:block ${solid ? 'border-vino/10' : 'border-white/30'}`} aria-label="Principal">
                    <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-[49px] px-8 font-nav text-[20px] font-light leading-[normal]">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative pt-1 after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-current after:transition-all hover:after:w-full ${
                                    isActive(link.href) ? 'after:w-full' : 'after:w-0'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto font-sans text-[13px] uppercase tracking-[0.16em] opacity-80 hover:opacity-100"
                        >
                            Escríbenos
                        </a>
                    </div>
                </nav>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="animate-rise border-t border-vino/10 bg-white px-5 pb-8 text-tinta lg:hidden">
                        {searchField('mt-5 flex h-12 border-transparent bg-rosa text-tinta focus-within:border-vino/40', {
                            autoFocus: true,
                        })}
                        <ul className="mt-4 divide-y divide-vino/10">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex w-full items-center justify-between py-4 font-nav text-[20px] font-light leading-[normal] ${
                                            isActive(link.href) ? 'text-vino' : ''
                                        }`}
                                    >
                                        {link.name} <ChevronRight width={18} height={18} className="text-vino" />
                                    </Link>
                                </li>
                            ))}
                            {user ? (
                                <>
                                    <li>
                                        <Link href="/mi-cuenta" onClick={() => setMobileMenuOpen(false)} className="block py-4 text-sm">
                                            Mi cuenta
                                        </Link>
                                    </li>
                                    {user.role === 'admin' && (
                                        <li>
                                            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-4 text-sm font-medium text-vino">
                                                Panel de administración
                                            </Link>
                                        </li>
                                    )}
                                    <li>
                                        <button onClick={handleLogout} className="block w-full py-4 text-left text-sm text-tinta/60">
                                            Cerrar sesión
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li className="flex gap-3 pt-5">
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex-1 rounded-full border border-tinta/15 py-3 text-center text-sm"
                                    >
                                        Iniciar sesión
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex-1 rounded-full bg-vino py-3 text-center text-sm font-medium text-white"
                                    >
                                        Crear cuenta
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-vino-deep text-white">
                <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
                    <div>
                        <Brand className="text-[32px] sm:text-[40px]" logoClassName="h-12 w-12" />
                        <p className="mt-5 max-w-sm text-white/65">
                            Joyería exclusiva con diseños únicos que reflejan tu estilo personal. Calidad premium en cada pieza.
                        </p>
                    </div>
                    <div>
                        <p className="text-[12px] uppercase tracking-[0.2em] text-champan">Navegación</p>
                        <ul className="mt-4 space-y-2.5 font-nav text-[20px] font-light leading-[normal]">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="hover:text-champan">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href={user ? '/mi-cuenta' : '/login'} className="hover:text-champan">
                                    {user ? 'Mi cuenta' : 'Iniciar sesión'}
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <p className="text-[12px] uppercase tracking-[0.2em] text-champan">Contacto</p>
                        <ul className="mt-4 space-y-3 text-white/80">
                            <li className="flex items-center gap-3">
                                <MailIcon className="shrink-0 text-champan" />
                                <a href={`mailto:${contacto.email}`} className="hover:text-champan">
                                    {contacto.email}
                                </a>
                            </li>
                            {contacto.whatsapp.map((numero) => (
                                <li key={numero} className="flex items-center gap-3">
                                    <PhoneIcon className="shrink-0 text-champan" />
                                    {numero}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-5 flex items-center gap-3">
                            <a
                                href={contacto.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram"
                                className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/30 transition-colors hover:bg-white hover:text-vino"
                            >
                                <InstagramIcon width={18} height={18} />
                            </a>
                            <a
                                href={contacto.tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="TikTok"
                                className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/30 transition-colors hover:bg-white hover:text-vino"
                            >
                                <TikTokIcon width={18} height={18} />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10 py-6 text-center text-xs text-white/45">
                    &copy; {new Date().getFullYear()} Joyería Gilded. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
}

