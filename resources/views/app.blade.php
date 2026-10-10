<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php($seo = $page['props']['seo'] ?? null)
        {{-- SEO rendered by the server so Google and link previews read it without JavaScript.
             Tags marked "inertia" are then kept up to date by the React <Seo> component. --}}
        <title inertia>{{ $seo['titulo'] ?? config('app.name', 'Laravel') }}</title>
        @if ($seo)
            <meta name="description" content="{{ $seo['descripcion'] }}" inertia="description">
            <meta name="robots" content="{{ $seo['robots'] }}" inertia="robots">
            <link rel="canonical" href="{{ $seo['canonical'] }}" inertia="canonical">
            <meta property="og:type" content="{{ $seo['tipo'] }}" inertia="og:type">
            <meta property="og:site_name" content="{{ $seo['sitio'] }}" inertia="og:site_name">
            <meta property="og:locale" content="{{ $seo['locale'] }}" inertia="og:locale">
            <meta property="og:title" content="{{ $seo['titulo'] }}" inertia="og:title">
            <meta property="og:description" content="{{ $seo['descripcion'] }}" inertia="og:description">
            <meta property="og:url" content="{{ $seo['canonical'] }}" inertia="og:url">
            @if ($seo['imagen'])
                <meta property="og:image" content="{{ $seo['imagen'] }}" inertia="og:image">
            @endif
            <meta name="twitter:card" content="summary_large_image" inertia="twitter:card">
            <meta name="twitter:title" content="{{ $seo['titulo'] }}" inertia="twitter:title">
            <meta name="twitter:description" content="{{ $seo['descripcion'] }}" inertia="twitter:description">
            @if ($seo['imagen'])
                <meta name="twitter:image" content="{{ $seo['imagen'] }}" inertia="twitter:image">
            @endif
            <script type="application/ld+json" id="seo-jsonld">{!! json_encode($seo['jsonld'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
        @endif
        @if ($verificacion = \App\Models\Ajuste::get('seo_google_verificacion'))
            <meta name="google-site-verification" content="{{ $verificacion }}">
        @endif
        <link rel="icon" href="/images/favicon.png" type="image/png">
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300..700&family=Newsreader:ital,opsz,wght@0,6..72,300..500;1,6..72,300..500&family=IM+Fell+French+Canon&family=Hind+Mysuru:wght@300;400&family=Holtwood+One+SC&family=Homemade+Apple&family=Hubballi&display=swap" rel="stylesheet">
        <meta name="theme-color" content="#53131e">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
