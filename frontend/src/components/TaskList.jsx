import React from 'react';
import { Check, Clock, Trash2, Calendar, Folder } from 'lucide-react';

const TaskList = ({ tasks, onStatusChange, onDelete }) => {
  
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority) => {
    if (priority >= 8) return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    if (priority >= 5) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-slate-500 line-through';
      case 'IN_PROGRESS':
        return 'border-l-4 border-indigo-500 pl-3';
      default:
        return 'border-l-4 border-slate-700 pl-3';
    }
  };

  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED');

  if (activeTasks.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 text-sm">
        ✨ No pending deadlines! You're completely caught up.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
      {activeTasks.map((task) => (
        <div 
          key={task.id} 
          className={`p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${getStatusStyle(task.status)}`}
        >
          {/* Left Block */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-200 text-sm md:text-base truncate">{task.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getPriorityColor(task.priority)}`}>
                P: {task.priority}
              </span>
              {task.category && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-700/50">
                  <Folder size={10} />
                  {task.category}
                </span>
              )}
            </div>
            
            {task.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
              <Calendar size={12} />
              <span>Due: {formatDate(task.deadline)}</span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            {task.status !== 'IN_PROGRESS' && (
              <button
                onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-colors"
              >
                In Progress
              </button>
            )}
            
            <button
              onClick={() => onStatusChange(task.id, 'COMPLETED')}
              className="p-2 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 rounded-lg transition-all border border-emerald-500/20"
              title="Mark Complete"
            >
              <Check size={16} />
            </button>

            <button
              onClick={() => onDelete(task.id)}
              className="p-2 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 rounded-lg transition-all border border-rose-500/20"
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          </div>

        </div>
      ))}
    </div>
  );
};

export default TaskList;
