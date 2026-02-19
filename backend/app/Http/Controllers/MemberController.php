<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\Member;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function store(Request $request, Trip $trip)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        return $trip->members()->create($validated);
    }
}
