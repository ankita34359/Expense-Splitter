<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = ['trip_id', 'title', 'amount', 'paid_by', 'split_between'];

    protected $casts = [
        'split_between' => 'array',
        'amount' => 'decimal:2'
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function payer()
    {
        return $this->belongsTo(Member::class, 'paid_by');
    }
}
