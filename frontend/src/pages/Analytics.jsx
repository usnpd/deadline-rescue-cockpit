import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import habitService from '../services/habitService';
import { BarChart3, TrendingUp, Sparkles, AlertCircle, Award } from 'lucide-react';

const Analytics = () => {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [aiInsight, setAiInsight] = useState('Loading habit insights...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [taskData, habitData] = await Promise.all([
          taskService.getTasks(),
          habitService.getHabits()
        ]);
        setTasks(taskData);
        setHabits(habitData);
        
        // Load AI Insights
        const insight = await habitService.getHabitAnalysis();
        setAiInsight(insight);
      } catch (err) {
        console.error('Failed to load analytics', err);
        setAiInsight('Make sure to log some task and habit data to get personalized insights.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
  const missedTasks = tasks.filter(t => t.status === 'MISSED').length;

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Render loading state
  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-950 p-6">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-slate-400">Loading performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <BarChart3 className="text-indigo-400" />
          Productivity Analytics
        </h1>
        <p className="text-slate-400 mt-1">Deep analysis of your performance, streaks, and AI recommendations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Metric 1 */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="text-sm font-semibold text-slate-400">Task Completion Rate</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{taskCompletionRate}%</span>
            <span className="text-xs text-emerald-400 flex items-center"><TrendingUp size={12} /> +4%</span>
          </div>
          {/* Custom SVG Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" style={{ width: `${taskCompletionRate}%` }}></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="text-sm font-semibold text-slate-400">Completed Tasks</div>
          <div className="mt-2 text-4xl font-extrabold text-indigo-400">{completedTasks}</div>
          <div className="text-xs text-slate-500 mt-1">out of {totalTasks} total tasks</div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="text-sm font-semibold text-slate-400">Active Deadlines</div>
          <div className="mt-2 text-4xl font-extrabold text-amber-400">{pendingTasks}</div>
          <div className="text-xs text-slate-500 mt-1">tasks currently pending</div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-6 rounded-xl">
          <div className="text-sm font-semibold text-slate-400">Missed Deadlines</div>
          <div className="mt-2 text-4xl font-extrabold text-rose-400">{missedTasks}</div>
          <div className="text-xs text-slate-500 mt-1">requires review</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Insight Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-slate-900/60">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={20} />
            Gemini Weekly Habit Pattern Insights
          </h2>
          <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap bg-slate-950/40 p-5 rounded-lg border border-slate-800/80">
            {aiInsight}
          </div>
        </div>

        {/* Habit Leaderboard / Summary */}
        <div className="glass-panel p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Award className="text-amber-400" size={20} />
            Habit Leaderboard
          </h2>
          <div className="space-y-4">
            {habits.length === 0 ? (
              <p className="text-slate-500 text-sm">No habits created yet. Go to Dashboard to start a habit!</p>
            ) : (
              habits.map((habit) => (
                <div key={habit.id} className="flex justify-between items-center p-3.5 bg-slate-900/60 border border-slate-800/50 rounded-lg">
                  <div>
                    <div className="font-semibold text-slate-200">{habit.name}</div>
                    <div className="text-xs text-slate-500">Longest Streak: {habit.longestStreak} days</div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm font-bold border border-amber-500/20">
                    🔥 {habit.currentStreak} Days
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
