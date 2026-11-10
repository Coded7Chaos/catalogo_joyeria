import { Link } from '@inertiajs/react';
import Marca from '@/Components/Marca';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-rosa px-5 py-10 text-tinta sm:justify-center">
            <Link href="/" className="flex items-center gap-3 text-vino">
                <img src="/images/logo-192.webp" alt="" className="h-12 w-12 rounded-full object-contain" />
                <Marca className="text-[28px]" />
            </Link>

            <div className="mt-8 w-full overflow-hidden rounded-[28px] bg-white px-6 py-8 shadow-[0_24px_60px_-30px_rgba(83,19,30,0.45)] sm:max-w-md sm:px-9">
                {children}
            </div>

            <Link href="/" className="mt-6 text-sm text-tinta/60 underline underline-offset-4 hover:text-vino">
                Volver a la tienda
            </Link>
        </div>
    );
}
