import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, BarChart3, LayoutDashboard, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, currentView, setCurrentView, logout } = useAuth();

  return (
    <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentView(user ? 'DASHBOARD' : 'HOME')} 
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <span className="text-2xl">🚨</span>
            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
              Last-Minute <span className="text-indigo-400">Life Saver</span>
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button
                  onClick={() => setCurrentView('DASHBOARD')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'DASHBOARD'
                      ? 'bg-slate-900 text-indigo-400 border border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('ANALYTICS')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'ANALYTICS'
                      ? 'bg-slate-900 text-indigo-400 border border-slate-800'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 size={16} />
                  Analytics
                </button>
                
                {/* User badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  {user.name}
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg transition-colors hover:bg-rose-950/20"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('LOGIN')}
                  className="text-slate-400 hover:text-slate-200 text-sm font-medium px-3 py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentView('SIGNUP')}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
