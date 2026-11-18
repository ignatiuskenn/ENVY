<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'customer_name' => is_string($this->customer_name) ? trim($this->customer_name) : $this->customer_name,
            'customer_email' => is_string($this->customer_email) ? strtolower(trim($this->customer_email)) : $this->customer_email,
            'customer_contact' => is_string($this->customer_contact) ? trim($this->customer_contact) : $this->customer_contact,
            'delivery_address' => is_string($this->delivery_address) ? trim($this->delivery_address) : $this->delivery_address,
            'order_notes' => is_string($this->order_notes) ? trim($this->order_notes) : $this->order_notes,
        ]);
    }

    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'min:1', 'max:255'],
            'customer_email' => ['required', 'email:rfc', 'max:255'],
            'customer_contact' => ['required', 'string', 'min:5', 'max:50', 'regex:/^[0-9+\-\s().]+$/'],
            'delivery_address' => ['required', 'string', 'min:3', 'max:1000'],
            'payment_method' => ['required', 'string', Rule::enum(PaymentMethod::class)],
            'order_notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.expected_unit_price' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
