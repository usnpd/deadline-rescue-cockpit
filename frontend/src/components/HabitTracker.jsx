import React, { useState } from 'react';
import habitService from '../services/habitService';
import { Flame, Check, Plus, HelpCircle, Sparkles } from 'lucide-react';

const HabitTracker = ({ habits, onRefresh }) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    try {
      await habitService.createHabit({ name: newHabitName });
      setNewHabitName('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkComplete = async (habitId) => {
    try {
      await habitService.markComplete(habitId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Generate last 30 days list for heatmap
  const getPast30Days = () => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const past30Days = getPast30Days();

  const isCompletedOnDate = (completedDates, dateStr) => {
    return completedDates.some(d => d.startsWith(dateStr));
  };

  return (
    <div className="glass-panel p-6 rounded-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Flame className="text-amber-500 animate-pulse" />
          Habit Streaks
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Keep streaks alive to build long-term momentum</p>
      </div>

      {/* Habits List */}
      <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1">
        {habits.length === 0 ? (
          <p className="text-slate-500 text-sm">No habits active yet. Add one below!</p>
        ) : (
          habits.map((habit) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const isDoneToday = isCompletedOnDate(habit.completedDates, todayStr);

            return (
              <div key={habit.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-200 text-sm">{habit.name}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-amber-500 text-xs font-bold">
                      <Flame size={14} />
                      <span>{habit.currentStreak} Day Streak</span>
                      <span className="text-slate-500 text-[10px] font-normal">(Record: {habit.longestStreak})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleMarkComplete(habit.id)}
                    disabled={isDoneToday}
                    className={`p-2 rounded-lg border transition-all flex items-center gap-1 ${
                      isDoneToday
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                    }`}
                  >
                    <Check size={16} />
                    <span className="text-xs font-bold px-1">{isDoneToday ? 'Done' : 'Complete'}</span>
                  </button>
                </div>

                {/* 30-Day Heatmap Grid */}
                <div>
                  <div className="text-[10px] text-slate-500 mb-1.5 font-bold">Last 30 Days</div>
                  <div className="grid grid-cols-10 gap-1">
                    {past30Days.map((dateStr) => {
                      const completed = isCompletedOnDate(habit.completedDates, dateStr);
                      return (
                        <div
                          key={dateStr}
                          title={dateStr}
                          className={`aspect-square w-full rounded-[2px] transition-colors ${
                            completed 
                              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' 
                              : 'bg-slate-800 border border-slate-700/30'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Habit Form */}
      <form onSubmit={handleCreateHabit} className="flex gap-2">
        <input
          type="text"
          required
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          className="flex-grow bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
          placeholder="New habit name (e.g. Read 10 mins)"
        />
        <button type="submit" className="btn-primary flex items-center justify-center p-2 rounded-lg text-xs shrink-0">
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
};

export default HabitTracker;
