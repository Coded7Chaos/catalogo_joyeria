import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { MARCA } from './lib/catalogo';

// El nombre de la tienda llega del servidor en la primera página (prop compartida `marca`).
// No se usa VITE_APP_NAME porque el deploy compila sin .env y quedaría "Laravel".
const paginaInicial = (() => {
    try {
        return JSON.parse(document.getElementById('app')?.dataset.page || '{}');
    } catch {
        return {};
    }
})();
const appName = paginaInicial.props?.marca || MARCA;

createInertiaApp({
    // Store pages send their full SEO title ("Producto | Tienda"); the rest get the app name.
    title: (title) => (title.includes(' | ') ? title : `${title} | ${appName}`),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#53131e',
    },
});
