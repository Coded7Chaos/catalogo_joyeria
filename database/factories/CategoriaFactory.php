<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Categoria>
 */
class CategoriaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // SOLUCIÓN: Usamos \Faker\Factory::create() con la barra invertida al inicio.
        // Esto fuerza a PHP a buscar la librería real y no una función local.
        $faker = \Faker\Factory::create();

        return [
            'categoria' => ucfirst($faker->randomElement([
                'Anillos', 
                'Pulseras', 
                'Collares', 
                'Piercings', 
                'Pendientes', 
                'Aretes', 
                'Conjuntos'
            ])),
        ];
    }
}