<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function index()
    {
        return Trip::with('members')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        return Trip::create($validated);
    }

    public function show(Trip $trip)
    {
        return $trip->load(['members', 'expenses.payer']);
    }

    public function destroy(Trip $trip)
    {
        $trip->delete();
        return response()->json(['message' => 'Trip deleted successfully']);
    }
}
