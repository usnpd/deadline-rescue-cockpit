import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import { AlertOctagon, Timer, Zap, ShieldAlert, Sparkles } from 'lucide-react';

const RescueMode = ({ taskId, onClose }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedSteps, setCheckedSteps] = useState([]);

  useEffect(() => {
    const fetchRescuePlan = async () => {
      try {
        const data = await taskService.getRescueMode(taskId);
        setPlan(data);
      } catch (err) {
        console.error('Failed to load rescue steps', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRescuePlan();
  }, [taskId]);

  const toggleStep = (idx) => {
    if (checkedSteps.includes(idx)) {
      setCheckedSteps(checkedSteps.filter(i => i !== idx));
    } else {
      setCheckedSteps([...checkedSteps, idx]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Background alarm glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-2xl bg-slate-950 border border-red-500/30 rounded-2xl p-6 md:p-8 relative z-10 shadow-2xl shadow-red-950/40">
        
        {/* Cockpit Header */}
        <div className="flex items-center gap-3 border-b border-red-500/20 pb-5 mb-6">
          <div className="h-10 w-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">
            <AlertOctagon size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-red-500">Hackathon Emergency Protocol</span>
            <h2 className="text-xl md:text-2xl font-black text-white">RESCUE MODE</h2>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-red-500 mx-auto"></div>
            <p className="mt-3 text-red-400 text-sm font-semibold">Gemini is building your emergency plan...</p>
          </div>
        ) : (
          plan && (
            <div className="space-y-6">
              
              {/* Motivational banner */}
              <div className="p-4 bg-red-950/30 border border-red-500/20 text-red-300 rounded-lg text-xs italic flex gap-2 items-center">
                <Sparkles className="text-red-400 shrink-0" size={14} />
                <span>"{plan.motivationalMessage}"</span>
              </div>

              {/* Emergency Checklist */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
                  <Timer size={14} className="text-red-400" />
                  Minute-by-Minute Action Plan
                </h3>
                
                <div className="space-y-3">
                  {plan.microSteps?.map((stepObj, idx) => (
                    <div 
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        checkedSteps.includes(idx)
                          ? 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
                          : 'bg-red-950/10 border-red-500/20 hover:border-red-500/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checkedSteps.includes(idx)}
                          readOnly
                          className="rounded border-slate-800 text-red-500 focus:ring-0 focus:ring-offset-0 accent-red-600 h-4 w-4 shrink-0"
                        />
                        <span className="text-xs md:text-sm font-medium">{stepObj.step}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                        checkedSteps.includes(idx)
                          ? 'bg-slate-950 text-slate-600'
                          : 'bg-red-500/20 text-red-400 border border-red-500/20'
                      }`}>
                        ⏱️ {stepObj.durationMinutes} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimum Viable Submission card */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
                  <Zap size={14} className="text-amber-400" />
                  Minimum Viable Submission (MVS)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {plan.minimumViableCompletion}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-3 gap-3">
                <button
                  onClick={onClose}
                  className="w-full btn-danger py-3 text-sm font-extrabold uppercase tracking-wide"
                >
                  I'm on it! (Close Protocol)
                </button>
              </div>

            </div>
          )
        )}

      </div>
    </div>
  );
};

export default RescueMode;
