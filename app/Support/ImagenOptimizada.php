<?php

namespace App\Support;

/**
 * Turns an uploaded photo into a light WebP for the web: straightens phone photos
 * (EXIF orientation), fits it in $max px and compresses it. A 4 MB phone picture
 * usually ends up around 150–300 KB, which keeps the store fast (and Google likes fast).
 */
class ImagenOptimizada
{
    /** WebP bytes, or null when it can't be converted (no GD, GIF, unreadable file). */
    public static function webp(string $ruta, int $max = 1600, int $calidad = 80): ?string
    {
        if (! function_exists('imagewebp')) {
            return null;
        }

        $info = @getimagesize($ruta);
        if (! $info) {
            return null;
        }

        // GIFs are left as they are: they may be animated.
        $imagen = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($ruta),
            IMAGETYPE_PNG => @imagecreatefrompng($ruta),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($ruta) : false,
            default => false,
        };
        if (! $imagen) {
            return null;
        }

        if ($info[2] === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
            $giro = match ((int) (@exif_read_data($ruta)['Orientation'] ?? 1)) {
                3 => 180,
                6 => -90,
                8 => 90,
                default => 0,
            };
            if ($giro !== 0 && ($rotada = imagerotate($imagen, $giro, 0))) {
                imagedestroy($imagen);
                $imagen = $rotada;
            }
        }

        $ancho = imagesx($imagen);
        $alto = imagesy($imagen);
        if (max($ancho, $alto) > $max) {
            $escala = $max / max($ancho, $alto);
            $reducida = imagescale($imagen, (int) round($ancho * $escala), (int) round($alto * $escala), IMG_BICUBIC);
            if ($reducida) {
                imagedestroy($imagen);
                $imagen = $reducida;
            }
        }

        // Keep PNG transparency.
        imagepalettetotruecolor($imagen);
        imagealphablending($imagen, false);
        imagesavealpha($imagen, true);

        ob_start();
        $ok = imagewebp($imagen, null, $calidad);
        $bytes = ob_get_clean();
        imagedestroy($imagen);

        return $ok && $bytes ? $bytes : null;
    }
}
