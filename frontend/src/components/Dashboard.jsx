import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import habitService from '../services/habitService';
import TaskInput from './TaskInput';
import TaskList from './TaskList';
import PriorityMatrix from './PriorityMatrix';
import HabitTracker from './HabitTracker';
import AIAssistant from './AIAssistant';
import MorningBriefing from './MorningBriefing';
import RescueMode from './RescueMode';
import { Clock, ShieldAlert, CheckCircle2, ListTodo, AlertTriangle, BrainCircuit } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [briefing, setBriefing] = useState('Generating your morning briefing...');
  const [nextTask, setNextTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [rescueTaskId, setRescueTaskId] = useState(null);
  const [showRescueOverlay, setShowRescueOverlay] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const [taskData, habitData] = await Promise.all([
        taskService.getTasks(),
        habitService.getHabits()
      ]);
      setTasks(taskData);
      setHabits(habitData);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBriefing = async () => {
    try {
      const briefingText = await taskService.getMorningBriefing();
      setBriefing(briefingText);
    } catch (err) {
      console.error('Error fetching briefing', err);
      setBriefing('Let\'s smash today\'s deadlines and make meaningful progress!');
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchBriefing();
  }, []);

  // Countdown timer & Rescue mode trigger logic
  useEffect(() => {
    if (tasks.length === 0) {
      setNextTask(null);
      setTimeLeft('');
      return;
    }

    const timer = setInterval(() => {
      const incomplete = tasks.filter(
        t => t.status !== 'COMPLETED' && t.status !== 'MISSED'
      );

      if (incomplete.length === 0) {
        setNextTask(null);
        setTimeLeft('All caught up!');
        return;
      }

      // Sort by closest deadline
      const sorted = [...incomplete].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      const closest = sorted[0];
      setNextTask(closest);

      const now = new Date();
      const deadline = new Date(closest.deadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('Deadline passed!');
        // Optional: mark task as MISSED in backend if passed
      } else {
        const hoursTotal = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        
        let displayStr = '';
        if (hoursTotal > 0) {
          displayStr += `${hoursTotal}h `;
        }
        displayStr += `${minutes}m ${seconds}s`;
        setTimeLeft(displayStr);

        // Auto show Rescue Mode if task is < 2 hours away
        if (diff < 2 * 60 * 60 * 1000 && closest.status !== 'COMPLETED') {
          setRescueTaskId(closest.id);
          // Only pop overlay if user hasn't dismissed/closed it recently
          if (!showRescueOverlay && !sessionStorage.getItem(`dismissed-rescue-${closest.id}`)) {
            setShowRescueOverlay(true);
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tasks, showRescueOverlay]);

  // Task Completion stats
  const totalTasksToday = tasks.length;
  const completedTasksToday = tasks.filter(t => t.status === 'COMPLETED').length;
  const completionPercentage = totalTasksToday > 0 ? Math.round((completedTasksToday / totalTasksToday) * 100) : 0;

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3 text-slate-400">Loading your mission dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow relative">
      
      {/* 2-hour Rescue Mode Alert Banner */}
      {nextTask && (new Date(nextTask.deadline) - new Date() < 2 * 60 * 60 * 1000) && (new Date(nextTask.deadline) - new Date() > 0) && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-950/80 to-rose-900/60 border border-red-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse-ring">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-rose-400 shrink-0" size={24} />
            <div>
              <span className="font-bold text-rose-200">CRITICAL DEADLINE INCOMING:</span>
              <p className="text-sm text-rose-300">"{nextTask.title}" is due in less than 2 hours!</p>
            </div>
          </div>
          <button
            onClick={() => setShowRescueOverlay(true)}
            className="btn-danger whitespace-nowrap flex items-center gap-1.5"
          >
            <ShieldAlert size={16} />
            Open Rescue Mode Guide
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Main Productivity Panel */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Banner widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Live Countdown widget */}
            <div className="glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[160px]">
              <div className="absolute -right-8 -bottom-8 text-indigo-500/5 pointer-events-none">
                <Clock size={160} />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Next Upcoming Deadline</h3>
                  <p className="font-bold text-white mt-1 text-sm truncate max-w-[200px]">
                    {nextTask ? nextTask.title : 'No active tasks'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Clock size={16} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-400 font-sans tracking-tight">
                  {timeLeft || '00m 00s'}
                </div>
              </div>
            </div>

            {/* Progress widget */}
            <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Progress</h3>
                  <p className="text-slate-500 text-xs mt-1">Keep checking off tasks</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-3xl font-extrabold text-white">{completionPercentage}%</span>
                  <span className="text-xs text-slate-400">{completedTasksToday}/{totalTasksToday} Tasks</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300" style={{ width: `${completionPercentage}%` }}></div>
                </div>
              </div>
            </div>

          </div>

          {/* Morning Briefing card */}
          <MorningBriefing briefing={briefing} onRefresh={fetchBriefing} />

          {/* Task creation input section */}
          <TaskInput onTaskCreated={fetchAllData} />

          {/* Task List */}
          <div className="glass-panel p-6 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ListTodo className="text-indigo-400" />
              Active Deadlines
            </h2>
            <TaskList tasks={tasks} onStatusChange={handleTaskStatusChange} onDelete={handleTaskDelete} />
          </div>

          {/* Priority Matrix */}
          <PriorityMatrix tasks={tasks} />

        </div>

        {/* Right Col: AI Assistant & Habits */}
        <div className="space-y-8">
          <AIAssistant tasks={tasks} habits={habits} />
          <HabitTracker habits={habits} onRefresh={fetchAllData} />
        </div>

      </div>

      {/* Rescue Mode Fullscreen overlay */}
      {showRescueOverlay && rescueTaskId && (
        <RescueMode 
          taskId={rescueTaskId} 
          onClose={() => {
            setShowRescueOverlay(false);
            sessionStorage.setItem(`dismissed-rescue-${rescueTaskId}`, 'true');
          }} 
        />
      )}

    </div>
  );
};

export default Dashboard;
