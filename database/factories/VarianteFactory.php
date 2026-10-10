<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Variante>
 */
class VarianteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => $this->faker->unique()->ean13(),
            'id_producto' => \App\Models\Producto::factory(),
            'precio' => $this->faker->randomFloat(2, 10, 90),
            'stock' => $this->faker->numberBetween(0, 100),
            'url_foto' => 'https://via.placeholder.com/300x300.png/eeeeee?text=Variante',
            'created_at' => now()
        ];
    }
}
