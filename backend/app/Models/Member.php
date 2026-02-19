<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    use HasFactory;

    protected $fillable = ['trip_id', 'name'];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function expensesPaid()
    {
        return $this->hasMany(Expense::class, 'paid_by');
    }
}
