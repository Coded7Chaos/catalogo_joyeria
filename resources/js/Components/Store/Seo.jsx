import { useEffect } from 'react';
import { Head } from '@inertiajs/react';

/**
 * Keeps the SEO tags of the page (sent by the server in the `seo` prop) up to
 * date while browsing. The first load already has them in the server HTML.
 */
export default function Seo({ seo }) {
    const jsonld = seo ? JSON.stringify(seo.jsonld ?? []) : null;

    // Structured data lives outside <Head> so it is never dropped during hydration.
    useEffect(() => {
        if (jsonld === null) return;
        let el = document.getElementById('seo-jsonld');
        if (!el) {
            el = document.createElement('script');
            el.type = 'application/ld+json';
            el.id = 'seo-jsonld';
            document.head.appendChild(el);
        }
        el.textContent = jsonld;
    }, [jsonld]);

    if (!seo) return null;

    return (
        <Head>
            <title>{seo.titulo}</title>
            <meta head-key="description" name="description" content={seo.descripcion} />
            <meta head-key="robots" name="robots" content={seo.robots} />
            <link head-key="canonical" rel="canonical" href={seo.canonical} />
            <meta head-key="og:type" property="og:type" content={seo.tipo} />
            <meta head-key="og:site_name" property="og:site_name" content={seo.sitio} />
            <meta head-key="og:locale" property="og:locale" content={seo.locale} />
            <meta head-key="og:title" property="og:title" content={seo.titulo} />
            <meta head-key="og:description" property="og:description" content={seo.descripcion} />
            <meta head-key="og:url" property="og:url" content={seo.canonical} />
            {seo.imagen && <meta head-key="og:image" property="og:image" content={seo.imagen} />}
            <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta head-key="twitter:title" name="twitter:title" content={seo.titulo} />
            <meta head-key="twitter:description" name="twitter:description" content={seo.descripcion} />
            {seo.imagen && <meta head-key="twitter:image" name="twitter:image" content={seo.imagen} />}
        </Head>
    );
}
