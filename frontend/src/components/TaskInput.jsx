import React, { useState } from 'react';
import taskService from '../services/taskService';
import { Plus, Sparkles, Send, Calendar, Folder } from 'lucide-react';

const TaskInput = ({ onTaskCreated }) => {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'ai'
  
  // Manual state
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  
  // AI State
  const [textDump, setTextDump] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!title || !deadline) return;

    try {
      await taskService.createTask({
        title,
        deadline,
        category,
        description
      });
      setTitle('');
      setDeadline('');
      setDescription('');
      onTaskCreated();
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!textDump.trim()) return;

    setLoading(true);
    setAiResult(null);

    try {
      const extracted = await taskService.extractTasks(textDump);
      setAiResult(extracted);
      setTextDump('');
      onTaskCreated();
    } catch (err) {
      console.error('Failed to extract tasks', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => { setActiveTab('manual'); setAiResult(null); }}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors ${
            activeTab === 'manual'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Manual Input
        </button>
        <button
          onClick={() => { setActiveTab('ai'); setAiResult(null); }}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 flex items-center gap-1.5 transition-colors ${
            activeTab === 'ai'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles size={16} className="text-purple-400" />
          AI Extract (Text Dump)
        </button>
      </div>

      {/* Manual Input Form */}
      {activeTab === 'manual' && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="e.g. Hackathon Pitch deck submission"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="General, Work, Study..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Deadline</label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                placeholder="Brief notes..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary flex items-center gap-1 text-sm py-2 px-5 font-semibold">
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </form>
      )}

      {/* AI Text Dump Form */}
      {activeTab === 'ai' && (
        <form onSubmit={handleAISubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Paste Unstructured Text</label>
            <textarea
              rows={4}
              required
              value={textDump}
              onChange={(e) => setTextDump(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-indigo-500 text-sm placeholder-slate-500"
              placeholder="Paste emails, syllabus schedules, messages, etc. For example: 'I need to review physics chapters 1-3 before my test tomorrow at 10 AM, and also submit the coding assignment by Friday night.'"
            />
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 max-w-[70%]">
              Gemini will parse this text, extract titles, estimate reasonable deadlines, assign categories, and pre-compute priority rankings.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-1.5 text-sm py-2 px-5 font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
                  Parsing...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-purple-300" />
                  Analyze with Gemini
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* AI Confirmation list */}
      {aiResult && (
        <div className="mt-6 p-4 bg-purple-950/20 border border-purple-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-3 text-purple-400 font-bold text-sm">
            <Sparkles size={16} />
            AI Extracted and Saved {aiResult.length} Tasks:
          </div>
          <div className="space-y-3">
            {aiResult.map((t, idx) => (
              <div key={idx} className="bg-slate-900/60 p-3 rounded border border-slate-800/80 text-xs flex flex-col md:flex-row justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-200">{t.title}</div>
                  <p className="text-slate-400 text-[10px] mt-0.5">{t.geminiReasoning}</p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded flex items-center gap-1">
                    <Folder size={10} />
                    {t.category}
                  </span>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold border border-indigo-500/20">
                    Priority: {t.priority}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskInput;
