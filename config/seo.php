<?php

/*
 * Valores por defecto del SEO. Desde el panel (Admin → SEO) se pueden cambiar el
 * nombre del sitio, el título de inicio, la descripción y la imagen para compartir.
 */
return [
    // Independiente de APP_NAME para no depender de cómo esté escrito en el .env.
    'nombre_sitio' => env('SEO_NOMBRE_SITIO', 'Qué elegancia la de Francia'),

    'lema' => 'Joyería exclusiva con diseños únicos',

    'descripcion' => 'Joyería exclusiva con diseños únicos: collares, anillos, pulseras y pendientes. Calidad premium y atención personalizada por WhatsApp.',

    'imagen' => '/images/logo-512.png',

    // Código ISO 4217 de la moneda de los precios (Bs. = BOB).
    'moneda' => env('SEO_MONEDA', 'BOB'),

    'locale' => 'es_BO',

    // Perfiles oficiales de la marca: ayudan a Google a relacionarlos con la tienda.
    'redes' => [
        'https://www.instagram.com/gilded_jewel_ry',
        'https://www.tiktok.com/@gilded_jewels0',
    ],
];
