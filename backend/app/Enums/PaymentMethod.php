<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case CashOnDelivery = 'Cash on Delivery';
    case EWallet = 'E-Wallet';
    case BankTransfer = 'Bank Transfer';
}
