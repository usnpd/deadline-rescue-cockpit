import React, { useState } from 'react';
import taskService from '../services/taskService';
import { Sun, RefreshCw, CalendarRange, Sparkles, X } from 'lucide-react';

const MorningBriefing = ({ briefing, onRefresh }) => {
  const [schedule, setSchedule] = useState('');
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshBriefing = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const handleGenerateSchedule = async () => {
    setLoadingSchedule(true);
    setSchedule('');
    setShowScheduleModal(true);
    try {
      const scheduleText = await taskService.getSchedule();
      setSchedule(scheduleText);
    } catch (err) {
      console.error(err);
      setSchedule('Failed to generate daily schedule. Make sure you have active pending tasks!');
    } finally {
      setLoadingSchedule(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/15 via-slate-900/40 to-slate-900/60 relative overflow-hidden">
      
      {/* Decorative sun glow in corner */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
            <Sun size={18} className="animate-spin [animation-duration:30s]" />
          </div>
          <h3 className="font-extrabold text-sm text-white">Gemini Morning Briefing</h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleGenerateSchedule}
            className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-2.5 py-1 rounded transition-colors flex items-center gap-1 shadow-sm active:scale-[0.98]"
          >
            <CalendarRange size={12} />
            Daily Timeblocks
          </button>
          
          <button
            onClick={handleRefreshBriefing}
            disabled={refreshing}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Refresh Briefing"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-900/50 text-slate-300 text-xs leading-relaxed italic">
        "{briefing}"
      </div>

      {/* Schedule Slide-out Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-950 border border-indigo-500/30 rounded-2xl p-6 relative shadow-2xl">
            
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-4 border-b border-slate-900 pb-3">
              <Sparkles className="text-indigo-400" size={20} />
              <h3 className="text-lg font-bold text-white">Your Time-Blocked Day</h3>
            </div>

            {loadingSchedule ? (
              <div className="py-12 text-center">
                <div className="h-6 w-6 animate-spin rounded-full border-t-2 border-indigo-500 mx-auto"></div>
                <p className="mt-3 text-slate-400 text-xs">Gemini is structuring your day...</p>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-slate-300 text-xs leading-relaxed whitespace-pre-wrap bg-slate-900/40 p-4 rounded-lg border border-slate-800/80 max-h-[350px] overflow-y-auto">
                {schedule}
              </div>
            )}

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="btn-secondary text-xs px-5 py-2"
              >
                Close Schedule
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MorningBriefing;
