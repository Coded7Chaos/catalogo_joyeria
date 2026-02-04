<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Producto>
 */
class ProductoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => ucfirst($this->faker->words(3, true)),
            'id_categoria' => \App\Models\Categoria::factory(),
            'url_foto' => 'https://via.placeholder.com/640x480.png/00ee00?text=Joya',
            'created_at' => now(),
        ];
    }
}
