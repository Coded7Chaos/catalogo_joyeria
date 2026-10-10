// Contenido fijo y utilidades del diseño de Figma Make.

const figma = '/images/figma';

export const assets = {
    heroSection: `${figma}/056f2.webp`,
    soyPrioridadBg: `${figma}/3ed16.svg`,
    soyPrioridadTrazo: `${figma}/27468.svg`,
    sarah: `${figma}/1eda6.webp`,
    // Figma Make no permite exportar estas dos fotos; mientras no existan en
    // public/images/figma se muestra su reemplazo de `imageFallbacks`.
    stefan: `${figma}/3f576.png`,
    handy: `${figma}/68a47.png`,
};

const unsplash = (id, w = 1080) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

export const stock = {
    modelNecklace: unsplash('1728647771865-636b715674f4'),
    necklace: unsplash('1601121141461-920cb1993441', 800),
    rings: unsplash('1543294001-f7cd5d7fb516', 800),
    bracelet: unsplash('1629118639934-2b241503956c', 800),
    earringsGold: unsplash('1665194132409-36fc84b2fe87', 800),
    pearlSet: unsplash('1654699991494-892326ee8171', 800),
    pearls: unsplash('1704957205327-9fbd44d683b7', 800),
};

export const imageFallbacks = {
    [assets.stefan]: stock.pearls,
    [assets.handy]: stock.rings,
};

const normalize = (text) =>
    (text ?? '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .trim()
        .toLowerCase();

/** Foto circular de cada colección, según el nombre de la categoría. */
const collectionCovers = {
    collares: stock.necklace,
    pulseras: stock.bracelet,
    pendientes: stock.earringsGold,
    aretes: stock.earringsGold,
    piercings: stock.earringsGold,
    anillos: stock.rings,
    conjuntos: stock.pearlSet,
};

/** Cover photo of a category: the one uploaded in the admin, else a stock photo by name. */
export const coverFor = (categoria) =>
    (typeof categoria === 'object' ? categoria?.imagen : null) ||
    collectionCovers[normalize(typeof categoria === 'object' ? categoria?.categoria : categoria)] ||
    null;

export const productoUrl = (producto) => (producto.slug ? `/producto/${producto.slug}` : `/catalogo/${producto.id}`);

export const categoriaUrl = (categoria) => `/categoria/${categoria.slug}`;

/** Every category of the menu tree in one flat list (roots and subcategories). */
export const aplanarCategorias = (arbol = []) => arbol.flatMap((c) => [c, ...aplanarCategorias(c.hijas)]);

export const findCategoria = (categorias, nombre) =>
    aplanarCategorias(categorias).find((c) => normalize(c.categoria) === normalize(nombre)) ?? null;

/** Tarjetas editoriales del tablero y la posición que ocupan, como en el frame de Figma. */
export const editorialTiles = [
    { id: 'good', kind: 'good-things', ratio: '88 / 150', at: 2 },
    { id: 'temporada', kind: 'temporada', ratio: '197 / 155', at: 5 },
    { id: 'soy', kind: 'soy-prioridad', ratio: '156 / 168', at: 6 },
];

// Formas del tablero tipo Pinterest; cada pieza conserva la suya según su id.
const RATIOS = ['4 / 5', '2 / 3', '1 / 1', '3 / 4', '5 / 4', '3 / 5', '4 / 5', '5 / 7'];

export const ratioFor = (id) => RATIOS[Number(id) % RATIOS.length];

export const formatPrice = (n) => `Bs. ${Number(n).toFixed(2)}`;

/** Foto principal de un producto: la primera variante que tenga foto. */
export const fotoDe = (producto) =>
    producto.variantes?.find((v) => v.url_foto)?.url_foto ?? producto.url_foto ?? null;

/** Precio más bajo entre las variantes con stock ("Desde" si hay varios precios). */
export function precioDe(producto) {
    const precios = (producto.variantes ?? [])
        .filter((v) => v.precio != null && (v.stock == null || v.stock > 0))
        .map((v) => Number(v.precio))
        .filter((p) => !Number.isNaN(p));
    if (precios.length === 0) return 'Consultar';
    const min = Math.min(...precios);
    return new Set(precios).size > 1 ? `Desde ${formatPrice(min)}` : formatPrice(min);
}

/** Distinct values of the color-type attributes across a product's variants. */
export const coloresDe = (producto) => [
    ...new Map(
        (producto.variantes ?? [])
            .flatMap((v) => v.valores ?? [])
            .filter((val) => val.atributo?.tipo === 'color' || val.cod_hex)
            .map((val) => [val.cod_hex ?? val.valor, { id: val.id, color: val.valor, cod_hex: val.cod_hex }]),
    ).values(),
];

/** "Dorado · 16" — a variant's values, in the order of their attributes. */
export const etiquetaVariante = (variante) =>
    [...(variante.valores ?? [])]
        .sort((a, b) => (a.atributo?.orden ?? 0) - (b.atributo?.orden ?? 0))
        .map((v) => v.valor)
        .join(' · ') || 'Estándar';

/** Datos de contacto de la tienda (pie de página y botones de WhatsApp). */
export const contacto = {
    email: 'contacto@gilded.com',
    whatsapp: ['73059904', '73707000'],
    instagram: 'https://www.instagram.com/gilded_jewel_ry?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    tiktok: 'https://www.tiktok.com/@gilded_jewels0?is_from_webapp=1&sender_device=pc',
};

export const whatsappUrl = (numero, mensaje) =>
    `https://wa.me/591${numero}?text=${encodeURIComponent(mensaje)}`;
