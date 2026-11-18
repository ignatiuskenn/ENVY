<?php

namespace App\Exceptions;

use RuntimeException;

class CheckoutConflictException extends RuntimeException
{
    /**
     * @param  list<array<string, mixed>>  $changes
     */
    public function __construct(
        string $message,
        public readonly array $changes = [],
    ) {
        parent::__construct($message);
    }
}
