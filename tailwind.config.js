import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                'joya': {
                    black: '#1A1A1A',
                    gold: '#C8A96E',
                    'gold-hover': '#B8944F',
                    cream: '#FAF8F5',
                    white: '#FFFFFF',
                    gray: '#6B6B6B',
                    border: '#E5E0D8',
                    dark: '#111111',
                },
            },
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
