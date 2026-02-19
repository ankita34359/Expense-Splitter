<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use Illuminate\Http\Request;

class SettlementController extends Controller
{
    public function calculate(Trip $trip)
    {
        $members = $trip->members;
        $expenses = $trip->expenses;

        $balances = [];
        foreach ($members as $member) {
            $balances[$member->id] = 0;
        }

        foreach ($expenses as $expense) {
            $amount = (float) $expense->amount;
            $payerId = $expense->paid_by;
            $participants = $expense->split_between;
            $numParticipants = count($participants);

            if ($numParticipants === 0) continue;

            $share = $amount / $numParticipants;

            // Payer gets credit for the full amount
            $balances[$payerId] += $amount;

            // Every participant (including payer if selected) owes their share
            foreach ($participants as $memberId) {
                $balances[$memberId] -= $share;
            }
        }

        // Optimized settlements logic
        $givers = [];
        $receivers = [];

        foreach ($members as $member) {
            $balance = round($balances[$member->id], 2);
            if ($balance < 0) {
                $givers[] = ['id' => $member->id, 'name' => $member->name, 'amount' => abs($balance)];
            } elseif ($balance > 0) {
                $receivers[] = ['id' => $member->id, 'name' => $member->name, 'amount' => $balance];
            }
        }

        // Sort to optimize (Greedy)
        usort($givers, fn($a, $b) => $b['amount'] <=> $a['amount']);
        usort($receivers, fn($a, $b) => $b['amount'] <=> $a['amount']);

        $settlements = [];
        $g = 0; $r = 0;

        while ($g < count($givers) && $r < count($receivers)) {
            $payment = min($givers[$g]['amount'], $receivers[$r]['amount']);
            
            if ($payment > 0) {
                $settlements[] = [
                    'from' => $givers[$g]['name'],
                    'from_id' => $givers[$g]['id'],
                    'to' => $receivers[$r]['name'],
                    'to_id' => $receivers[$r]['id'],
                    'amount' => round($payment, 2)
                ];
            }

            $givers[$g]['amount'] -= $payment;
            $receivers[$r]['amount'] -= $payment;

            if ($givers[$g]['amount'] < 0.01) $g++;
            if ($receivers[$r]['amount'] < 0.01) $r++;
        }

        return [
            'balances' => array_map(fn($m) => [
                'name' => $m->name,
                'balance' => round($balances[$m->id], 2)
            ], $members->all()),
            'settlements' => $settlements
        ];
    }
}
