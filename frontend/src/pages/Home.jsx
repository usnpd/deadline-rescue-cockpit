import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Zap, Calendar, Sparkles } from 'lucide-react';

const Home = () => {
  const { setCurrentView } = useAuth();

  return (
    <div className="relative overflow-hidden bg-slate-950 py-16 sm:py-24 flex-grow flex flex-col justify-center">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/3 w-[300px] h-[300px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-950/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <ShieldAlert size={14} />
            Hackathon Emergency Tool
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Last-Minute <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">Life Saver</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-slate-400">
            An agentic AI productivity suite that detects looming deadlines, builds emergency step-by-step rescue plans, auto-extracts tasks from unstructured text dumps, and keeps your habits alive.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={() => setCurrentView('SIGNUP')}
              className="btn-primary px-8 py-3 text-base font-semibold shadow-lg shadow-indigo-500/20"
            >
              Get Saved Now
            </button>
            <button
              onClick={() => setCurrentView('LOGIN')}
              className="btn-secondary px-8 py-3 text-base font-semibold"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mx-auto mt-20 max-w-5xl sm:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            
            <div className="flex flex-col items-center glass-panel p-8 rounded-2xl relative group hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldAlert size={24} />
              </div>
              <dt className="text-lg font-bold text-white leading-7">Emergency Rescue Mode</dt>
              <dd className="mt-4 text-sm leading-6 text-slate-400">
                When a task is less than 2 hours away, our system triggers Rescue Mode. Gemini constructs a minute-by-minute survival guide, stripping out fluff so you submit on time.
              </dd>
            </div>

            <div className="flex flex-col items-center glass-panel p-8 rounded-2xl relative group hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <dt className="text-lg font-bold text-white leading-7">AI Text-Dump Extraction</dt>
              <dd className="mt-4 text-sm leading-6 text-slate-400">
                Stop filling forms. Paste a messy syllabus, Slack thread, or email dump. Gemini extracts titles, schedules reasonable deadlines, and assigns priority ratings automatically.
              </dd>
            </div>

            <div className="flex flex-col items-center glass-panel p-8 rounded-2xl relative group hover:border-indigo-500/30 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <dt className="text-lg font-bold text-white leading-7">Streak Optimizer</dt>
              <dd className="mt-4 text-sm leading-6 text-slate-400">
                Maintains your daily habits with interactive completion calendars. Gemini analyzes weekly patterns to recommend habit-stacking strategies custom-tailored to your routine.
              </dd>
            </div>

          </dl>
        </div>
      </div>
    </div>
  );
};

export default Home;
