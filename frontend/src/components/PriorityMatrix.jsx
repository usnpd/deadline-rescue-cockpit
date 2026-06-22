import React from 'react';
import { ShieldAlert, Zap, Calendar, MessageSquare } from 'lucide-react';

const PriorityMatrix = ({ tasks }) => {
  const pending = tasks.filter(t => t.status !== 'COMPLETED');

  // Filter tasks into 4 Eisenhower quadrants based on priority score (1-10)
  const q1 = pending.filter(t => t.priority >= 8); // Urgent & Important
  const q2 = pending.filter(t => t.priority >= 5 && t.priority < 8); // Important & Not Urgent
  const q3 = pending.filter(t => t.priority >= 3 && t.priority < 5); // Urgent & Not Important
  const q4 = pending.filter(t => t.priority < 3); // Not Urgent & Not Important

  const renderCardList = (taskList, emptyMessage, borderColor) => {
    if (taskList.length === 0) {
      return <div className="text-slate-500 text-xs py-4 text-center">{emptyMessage}</div>;
    }

    return (
      <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
        {taskList.map((task) => (
          <div key={task.id} className={`p-2.5 bg-slate-950/60 rounded-lg border-l-4 ${borderColor} border-y border-r border-slate-800/80`}>
            <div className="flex justify-between items-start gap-1">
              <span className="font-bold text-xs text-slate-200 line-clamp-1">{task.title}</span>
              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded shrink-0">P: {task.priority}</span>
            </div>
            {task.geminiReasoning && (
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 italic">"{task.geminiReasoning}"</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 rounded-xl">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="text-indigo-400" />
          Eisenhower Priority Matrix
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Tasks auto-categorized based on Gemini priority ratings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Quadrant 1 */}
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-rose-400 font-extrabold text-sm mb-3">
              <ShieldAlert size={16} />
              Do First (Urgent & Important)
            </div>
            {renderCardList(q1, 'No critical emergencies. Keep it up!', 'border-rose-500')}
          </div>
        </div>

        {/* Quadrant 2 */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm mb-3">
              <Calendar size={16} />
              Schedule (Important, Not Urgent)
            </div>
            {renderCardList(q2, 'No scheduled project tasks.', 'border-amber-500')}
          </div>
        </div>

        {/* Quadrant 3 */}
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-blue-400 font-extrabold text-sm mb-3">
              <Zap size={16} />
              Delegate (Urgent, Not Important)
            </div>
            {renderCardList(q3, 'No busywork tasks.', 'border-blue-500')}
          </div>
        </div>

        {/* Quadrant 4 */}
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 font-extrabold text-sm mb-3">
              <MessageSquare size={16} />
              Eliminate (Not Urgent & Not Important)
            </div>
            {renderCardList(q4, 'Clean sheet! No low-value tasks.', 'border-slate-600')}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PriorityMatrix;
