// client/src/components/Dashboard/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, BarChart3, TrendingUp, Settings, Hash } from 'lucide-react';
import ThemeToggle from '../UI/ThemeToggle';
import OnboardingTour from '../OnboardingTour';
import { useOnboarding } from '../../hooks/useOnboarding';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Topics', href: '/topics', icon: Hash }, // Add this line
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const {
    showOnboarding,
    currentStep,
    nextStep,
    prevStep,
    completeOnboarding,
    setShowOnboarding,
  } = useOnboarding();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64
          bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
          transform transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                BuzzTrack
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowOnboarding(true)}
              className="w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
            >
              Show Tour Again
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-700 dark:text-slate-300"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          onComplete={completeOnboarding}
          onSkip={completeOnboarding}
        />
      )}
    </div>
  );
}