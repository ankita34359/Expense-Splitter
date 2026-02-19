<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function store(Request $request, Trip $trip)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'paid_by' => 'required|exists:members,id',
            'split_between' => 'required|array',
            'split_between.*' => 'exists:members,id',
        ]);

        return $trip->expenses()->create($validated);
    }

    public function index(Trip $trip)
    {
        return $trip->expenses()->with('payer')->get();
    }

    public function update(Request $request, Trip $trip, Expense $expense)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'paid_by' => 'required|exists:members,id',
            'split_between' => 'required|array',
            'split_between.*' => 'exists:members,id',
        ]);

        $expense->update($validated);
        return $expense;
    }
}
