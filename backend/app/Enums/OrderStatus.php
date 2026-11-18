<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'Pending';
    case Confirmed = 'Confirmed';
    case Preparing = 'Preparing';
    case Shipped = 'Shipped';
    case Completed = 'Completed';
    case Cancelled = 'Cancelled';

    /**
     * Allowed next statuses from the current status per CubeTech workflow.
     *
     * @return list<self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending => [self::Confirmed, self::Cancelled],
            self::Confirmed => [self::Preparing, self::Cancelled],
            self::Preparing => [self::Shipped],
            self::Shipped => [self::Completed],
            self::Completed, self::Cancelled => [],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, $this->allowedTransitions(), true);
    }

    public function canBeCancelled(): bool
    {
        return $this === self::Pending || $this === self::Confirmed;
    }
}
