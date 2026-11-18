<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;

class SaveCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->name) ? trim($this->name) : $this->name,
        ]);
    }

    public function rules(): array
    {
        $ignoreId = $this->route('category')?->id ?? $this->route('category');

        return [
            'name' => [
                'required',
                'string',
                'min:1',
                'max:255',
                function (string $attribute, mixed $value, \Closure $fail) use ($ignoreId): void {
                    $normalized = mb_strtolower(trim((string) $value));
                    $exists = Category::query()
                        ->when($ignoreId, fn ($q) => $q->where('id', '!=', (int) $ignoreId))
                        ->whereRaw('LOWER(TRIM(name)) = ?', [$normalized])
                        ->exists();

                    if ($exists) {
                        $fail('A category with this name already exists.');
                    }
                },
            ],
        ];
    }
}
