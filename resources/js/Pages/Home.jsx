import { Head, Link } from '@inertiajs/react';

export default function Home({ novedades, categorias }) {
   
    return (
        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {categorias.map(cat => (
                <label key={cat.id} className="flex items-center group cursor-pointer">
        <input 
            type="radio" // CAMBIO AQUÍ
            name="categoria_filter" // Importante para que el navegador sepa que son grupo
            value={cat.id}
            // Verificamos si es IGUAL al seleccionado
            checked={selectedCategory === cat.id.toString()}
            // Usamos la nueva función
            onChange={() => handleCategorySelect(cat.id)}
            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
        />
        <span className={`ml-3 text-sm transition-colors ${
            selectedCategory === cat.id.toString() ? 'font-bold text-indigo-700' : 'text-gray-600'
        }`}>
            {cat.categoria}
        </span>
    </label>
))}
</div>
    );
}
