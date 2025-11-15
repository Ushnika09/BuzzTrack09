// client/src/components/Dashboard/DashboardLayout.jsx
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Menu,
  Home,
  BarChart3,
  TrendingUp,
  Hash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ThemeToggle from "../UI/ThemeToggle";
import OnboardingTour from "../OnboardingTour";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useTheme } from "../../context/ThemeContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Topics", href: "/topics", icon: Hash },
];

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const {
    showOnboarding,
    currentStep,
    nextStep,
    prevStep,
    completeOnboarding,
    setShowOnboarding,
  } = useOnboarding();

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);
  const toggleMobileSidebar = () => setMobileSidebarOpen((v) => !v);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-slate-900 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen transition-all duration-300
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${sidebarCollapsed ? "w-20" : "w-64"}
          lg:translate-x-0
          ${theme === "dark" ? "bg-slate-800" : "bg-white"}
          border-r ${theme === "dark" ? "border-slate-700" : "border-slate-200"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header - only collapse button  */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              theme === "dark" ? "border-slate-700" : "border-slate-200"
            }`}
          >
            {/* Collapse button  */}
            <button
              onClick={toggleSidebar}
              className={`hidden lg:block transition-colors py-[10px] ${
                theme === "dark"
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
              title="Collapse sidebar"
            >
              <ChevronLeft
                className={`w-5 h-5 ${sidebarCollapsed && "rotate-180"}`}
              />
            </button>

            {/* Empty spacer when collapsed so button stays centered */}
            {sidebarCollapsed && <div className="w-8" />}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative
                    ${
                      isActive
                        ? theme === "dark"
                          ? "bg-blue-900/20 text-blue-400 font-medium"
                          : "bg-blue-50 text-blue-600 font-medium"
                        : theme === "dark"
                        ? "text-slate-300 hover:bg-slate-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.name}</span>}

                  {/* Tooltip when collapsed */}
                  {sidebarCollapsed && (
                    <div
                      className={`absolute left-full ml-2 px-2 py-1 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap ${
                        theme === "dark"
                          ? "bg-slate-700 text-white"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div
            className={`p-4 border-t ${
              theme === "dark" ? "border-slate-700" : "border-slate-200"
            }`}
          >
            {/* Expand/Collapse button at bottom */}
            <button
              onClick={toggleSidebar}
              className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "text-slate-400 hover:text-white hover:bg-slate-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>

            {/* Show Tour button (visible only when expanded) */}
            {!sidebarCollapsed && (
              <button
                onClick={() => setShowOnboarding(true)}
                className={`mt-3 w-full px-4 py-2 text-sm text-left rounded-lg transition-colors ${
                  theme === "dark"
                    ? "text-slate-400 hover:text-white hover:bg-slate-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Show Tour Again
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Layout (with top header that always shows logo) */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Header */}
        <header
          className={`sticky top-0 z-30 backdrop-blur-lg border-b ${
            theme === "dark"
              ? "bg-slate-800/80 border-slate-700"
              : "bg-white/80 border-slate-200"
          }`}
        >
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            {/* Left side: Hamburger (mobile) + Logo (always visible) */}
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger */}
              <button
                onClick={toggleMobileSidebar}
                className={`lg:hidden transition-colors ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo + App Name */}
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-xl font-bold hidden sm:block ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}
                >
                  BuzzTrack
                </span>
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="">
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
