<?php

use App\Http\Controllers\TripController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\SettlementController;
use Illuminate\Support\Facades\Route;

Route::get('/trips', [TripController::class, 'index']);
Route::post('/trips', [TripController::class, 'store']);
Route::get('/trips/{trip}', [TripController::class, 'show']);
Route::delete('/trips/{trip}', [TripController::class, 'destroy']);

Route::post('/trips/{trip}/members', [MemberController::class, 'store']);

Route::get('/trips/{trip}/expenses', [ExpenseController::class, 'index']);
Route::post('/trips/{trip}/expenses', [ExpenseController::class, 'store']);
Route::put('/trips/{trip}/expenses/{expense}', [ExpenseController::class, 'update']);

Route::get('/trips/{trip}/settlements', [SettlementController::class, 'calculate']);
