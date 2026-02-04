import React from 'react';

export default function Index({productos}){
    return (
        <div>
            <h1>Mis joyas</h1>
            <ul>
                {productos.map( producto => (
                    <li key={producto.id} > {producto.nombre} - {producto.categoria.categoria}</li>
                ) )}  
            </ul>
        </div>
    );
}