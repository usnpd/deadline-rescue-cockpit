import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Analytics from './pages/Analytics';
import Dashboard from './components/Dashboard';

const AppContent = () => {
  const { currentView, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-slate-400 font-medium">Powering up your Life Saver...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return <Home />;
      case 'LOGIN':
        return <Login />;
      case 'SIGNUP':
        return <Signup />;
      case 'DASHBOARD':
        return <Dashboard />;
      case 'ANALYTICS':
        return <Analytics />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col">
        {renderView()}
      </main>
      <footer className="py-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-600">
        © 2026 Last-Minute Life Saver. Built for Google Productivity Hackathon. All rights reserved.
      </footer>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
