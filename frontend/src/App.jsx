import React, { useState, useEffect } from 'react';
import { tripService } from './api';
import { Plus, Users, Receipt, Calculator, ChevronRight, Home, Trash2 } from 'lucide-react';

const App = () => {
    const [view, setView] = useState('home'); // home, setup, detail, settle
    const [trips, setTrips] = useState([]);
    const [currentTrip, setCurrentTrip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form states
    const [newTripName, setNewTripName] = useState('');
    const [memberNames, setMemberNames] = useState(['', '']);
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        paid_by: '',
        split_between: []
    });
    const [settlements, setSettlements] = useState(null);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await tripService.getAll();
            setTrips(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const tripRes = await tripService.create({ name: newTripName });
            const tripId = tripRes.data.id;

            // Add members
            for (const name of memberNames.filter(n => n.trim() !== '')) {
                await tripService.addMember(tripId, { name });
            }

            await fetchTrips();
            handleSelectTrip(tripId);
            setNewTripName('');
            setMemberNames(['', '']);
        } catch (err) {
            setError("Failed to create trip");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTrip = async (id) => {
        setLoading(true);
        try {
            const res = await tripService.getById(id);
            setCurrentTrip(res.data);
            setView('detail');
            setExpenseForm({ ...expenseForm, split_between: res.data.members.map(m => m.id) });
        } catch (err) {
            setError("Failed to load trip details");
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!expenseForm.paid_by || expenseForm.split_between.length === 0) {
            alert("Please select who paid and at least one participant");
            return;
        }
        setLoading(true);
        try {
            await tripService.addExpense(currentTrip.id, expenseForm);
            await handleSelectTrip(currentTrip.id);
            setExpenseForm({
                title: '',
                amount: '',
                paid_by: '',
                split_between: currentTrip.members.map(m => m.id)
            });
        } catch (err) {
            setError("Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    const fetchSettlements = async () => {
        setLoading(true);
        try {
            const res = await tripService.getSettlements(currentTrip.id);
            setSettlements(res.data);
            setView('settle');
        } catch (err) {
            setError("Failed to calculate settlements");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTrip = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this trip and all its expenses?")) return;

        try {
            await tripService.delete(id);
            await fetchTrips();
        } catch (err) {
            console.error(err);
            alert("Failed to delete trip");
        }
    };

    const toggleParticipant = (memberId) => {
        setExpenseForm(prev => {
            const current = [...prev.split_between];
            if (current.includes(memberId)) {
                return { ...prev, split_between: current.filter(id => id !== memberId) };
            } else {
                return { ...prev, split_between: [...current, memberId] };
            }
        });
    };

    const quotes = [
        "\"Good accounts make good friends.\" — French Proverb",
        "\"Friendship and money should never be mixed, unless you have TripSplit.\"",
        "\"Split the bill, not the friendship.\"",
        "\"Travel is the only thing you buy that makes you richer... except when you're paying for everyone.\""
    ];

    const randomQuote = quotes[Math.floor(Date.now() / 86400000) % quotes.length];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
            <header className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-indigo-600 flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
                    <Calculator className="w-8 h-8" /> TripSplit
                </h1>
                {view !== 'home' && (
                    <button
                        onClick={() => setView('home')}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                    >
                        <Home className="w-6 h-6" />
                    </button>
                )}
            </header>

            <main className="max-w-4xl mx-auto">
                {view === 'home' && (
                    <div className="grid gap-8">
                        <section className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-indigo-50 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12 opacity-50"></div>

                            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800">Travel More, Worry Less</h2>
                            <p className="text-base md:text-lg text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                                The easiest way to track group expenses and settle up fairly. No more messy spreadsheets or awkward money talks.
                            </p>

                            <div className="bg-indigo-50 p-4 rounded-2xl mb-8 inline-block italic text-indigo-700 font-medium border border-indigo-100">
                                {randomQuote}
                            </div>

                            <button
                                onClick={() => setView('setup')}
                                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200 flex items-center gap-2 mx-auto"
                            >
                                <Plus className="w-6 h-6" /> Create New Trip
                            </button>
                        </section>

                        <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-700">
                                <span className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Users className="w-5 h-5" /></span>
                                Your Recent Trips
                            </h2>
                            <div className="grid gap-4">
                                {trips.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                                        <p className="text-slate-400 italic">You haven't planned any trips yet. Start your first adventure!</p>
                                    </div>
                                ) : (
                                    trips.slice().reverse().map(trip => (
                                        <div
                                            key={trip.id}
                                            onClick={() => handleSelectTrip(trip.id)}
                                            className="group flex justify-between items-center p-5 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer transition-all active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 text-left w-full">
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg md:text-xl uppercase">
                                                    {trip.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-base md:text-lg text-slate-800 group-hover:text-indigo-700 transition-colors truncate">{trip.name}</h3>
                                                    <p className="text-xs md:text-sm text-slate-500 font-medium flex items-center gap-1">
                                                        <Users className="w-3 h-3" /> {trip.members?.length || 0} participants
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => handleDeleteTrip(e, trip.id)}
                                                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Delete Trip"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="grid gap-4 md:grid-cols-3 md:gap-6">
                            <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                                <h4 className="font-bold text-green-700 mb-2">1. Add Members</h4>
                                <p className="text-sm text-green-600/80">List all your travel buddies who will be sharing expenses.</p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <h4 className="font-bold text-blue-700 mb-2">2. Track Spends</h4>
                                <p className="text-sm text-blue-600/80">Log every dinner, taxi ride, or ticket as you go.</p>
                            </div>
                            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                <h4 className="font-bold text-amber-700 mb-2">3. Settle Up</h4>
                                <p className="text-sm text-amber-600/80">Get the simplest plan for who pays who to clear debts.</p>
                            </div>
                        </section>
                    </div>
                )}

                {view === 'setup' && (
                    <form onSubmit={handleCreateTrip} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in duration-300">
                        <h2 className="text-2xl font-bold mb-8">Setup Trip</h2>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Trip Name</label>
                            <input
                                required
                                value={newTripName}
                                onChange={(e) => setNewTripName(e.target.value)}
                                placeholder="e.g. Goa Trip 2024"
                                className="w-full text-2xl font-bold border-b-2 border-slate-200 focus:border-indigo-500 outline-none pb-2 transition-colors"
                            />
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Participants</label>
                            <div className="space-y-3">
                                {memberNames.map((name, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            required
                                            value={name}
                                            onChange={(e) => {
                                                const newNames = [...memberNames];
                                                newNames[index] = e.target.value;
                                                setMemberNames(newNames);
                                            }}
                                            placeholder={`Friend ${index + 1}`}
                                            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                                        />
                                        {memberNames.length > 2 && (
                                            <button
                                                type="button"
                                                onClick={() => setMemberNames(memberNames.filter((_, i) => i !== index))}
                                                className="p-3 text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setMemberNames([...memberNames, ''])}
                                    className="text-indigo-600 font-medium text-sm hover:underline flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Add another person
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Trip"}
                        </button>
                    </form>
                )}

                {view === 'detail' && currentTrip && (
                    <div className="grid md:grid-cols-5 gap-6 animate-in slide-in-from-bottom duration-500">
                        {/* Summary Sidebar */}
                        <aside className="md:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h2 className="text-3xl font-bold mb-2">{currentTrip.name}</h2>
                                <p className="text-slate-500 mb-6 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> {currentTrip.members.length} members
                                </p>
                                <button
                                    onClick={fetchSettlements}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <Calculator className="w-5 h-5" /> Settle Up
                                </button>
                            </div>

                            <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl">
                                <h3 className="text-indigo-300 uppercase text-xs font-bold tracking-widest mb-4">Quick Stats</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-indigo-400 text-sm">Total Spent</p>
                                        <p className="text-2xl font-bold">₹{currentTrip.expenses?.reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-400 text-sm">Expenses</p>
                                        <p className="text-2xl font-bold">{currentTrip.expenses?.length || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Expense Section */}
                        <div className="md:col-span-3 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-indigo-500" /> Add Expense
                                </h3>
                                <form onSubmit={handleAddExpense} className="space-y-4">
                                    <input
                                        required
                                        value={expenseForm.title}
                                        onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })}
                                        placeholder="What was it for?"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
                                    />
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={expenseForm.amount}
                                        onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                        placeholder="Amount (₹)"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none"
                                    />
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Who Paid?</label>
                                        <select
                                            required
                                            value={expenseForm.paid_by}
                                            onChange={e => setExpenseForm({ ...expenseForm, paid_by: e.target.value })}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 outline-none appearance-none"
                                        >
                                            <option value="">Select person</option>
                                            {currentTrip.members.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Participated In</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {currentTrip.members.map(m => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => toggleParticipant(m.id)}
                                                    className={`p-2 text-sm rounded-lg border transition-all ${expenseForm.split_between.includes(m.id)
                                                        ? 'bg-indigo-100 border-indigo-400 text-indigo-700 font-medium'
                                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {m.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all">
                                        Add Expense
                                    </button>
                                </form>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-lg mb-4">History</h3>
                                <div className="space-y-3">
                                    {!currentTrip.expenses || currentTrip.expenses.length === 0 ? (
                                        <p className="text-slate-400 text-center py-4 italic">No expenses yet.</p>
                                    ) : (
                                        currentTrip.expenses.slice().reverse().map(expense => (
                                            <div key={expense.id} className="flex justify-between items-center p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold">{expense.title}</p>
                                                    <p className="text-xs text-slate-500">Paid by {expense.payer?.name} • Split with {expense.split_between.length} people</p>
                                                </div>
                                                <p className="font-bold text-lg text-slate-700">₹{parseFloat(expense.amount).toFixed(2)}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'settle' && settlements && (
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in duration-300 max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calculator className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold">Total Settlement</h2>
                            <p className="text-slate-500">Optimized transactions to clear all debts.</p>
                        </div>

                        <div className="space-y-4 mb-8">
                            {settlements.settlements.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium text-lg">Everything is settled! No one owes anyone.</p>
                                </div>
                            ) : (
                                settlements.settlements.map((s, i) => (
                                    <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex-1">
                                            <span className="font-bold text-lg text-indigo-700">{s.from}</span>
                                            <span className="text-slate-400 mx-2 italic font-medium">pays</span>
                                            <span className="font-bold text-lg text-green-700">{s.to}</span>
                                        </div>
                                        <div className="text-2xl font-black text-slate-800">₹{s.amount}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8">
                            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Final Balances</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {settlements.balances.map((b, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-slate-600">{b.name}</span>
                                        <span className={`font-bold ${b.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {b.balance >= 0 ? '+' : ''}₹{b.balance}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setView('detail')}
                            className="w-full py-4 rounded-2xl font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                        >
                            Back to Trip
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
