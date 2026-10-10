import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.js',
    ],

    theme: {
        extend: {
            colors: {
                // Paleta del diseño de Figma Make: vino + rosa empolvado + dorado champán + azul marino
                vino: {
                    DEFAULT: '#53131e',
                    deep: '#34090f',
                    soft: '#7a2232',
                },
                rosa: {
                    DEFAULT: '#f7e6e2',
                    deep: '#efd2cb',
                },
                champan: {
                    DEFAULT: '#c9a46a',
                    deep: '#a9834a',
                },
                marino: '#053c5e',
                tinta: '#1b1214',
                humo: '#f3f0ef',
                // Nombres originales del proyecto, apuntando a la paleta de Figma
                // para que todas las páginas (tienda, cuenta y admin) la compartan.
                'joya': {
                    black: '#1b1214',
                    gold: '#7a2232',
                    'gold-hover': '#53131e',
                    cream: '#f3f0ef',
                    white: '#FFFFFF',
                    gray: '#7d6c6f',
                    border: '#ebe1e1',
                    dark: '#34090f',
                },
            },
            fontFamily: {
                sans: ['"DM Sans"', ...defaultTheme.fontFamily.sans],
                display: ['Newsreader', 'Georgia', 'serif'],
                brand: ['"IM Fell French Canon"', 'Newsreader', 'Georgia', 'serif'],
                nav: ['"Hind Mysuru"', '"DM Sans"', 'sans-serif'],
                hind: ['"Hind Mysuru"', '"DM Sans"', 'sans-serif'],
                holtwood: ['"Holtwood One SC"', 'Georgia', 'serif'],
                apple: ['"Homemade Apple"', 'cursive'],
                hubballi: ['Hubballi', '"DM Sans"', 'sans-serif'],
            },
            keyframes: {
                rise: {
                    from: { opacity: '0', transform: 'translateY(18px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                rise: 'rise 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both',
            },
        },
    },

    plugins: [forms],
};
