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
  Sparkles,
  Zap,
  Crown,
  Activity,
  Target,
} from "lucide-react";
import ThemeToggle from "../UI/ThemeToggle";
import OnboardingTour from "../OnboardingTour";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useTheme } from "../../context/ThemeContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, badge: "live" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, badge: "pro" },
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
      className={`min-h-screen transition-all duration-500 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
          : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-slate-900"
      }`}
    >
      {/* Premium Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-lg z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Premium Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen transition-all duration-500 ease-out
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${sidebarCollapsed ? "w-20" : "w-72"}
          lg:translate-x-0
          ${theme === "dark" 
            ? "bg-slate-800/90 backdrop-blur-xl border-slate-700/50" 
            : "bg-white/90 backdrop-blur-xl border-slate-200/50"
          }
          border-r shadow-2xl
        `}
      >
        <div className="flex flex-col h-full">
          {/* ENHANCED Premium Sidebar Header with Logo */}
          <div
            className={`relative p-6 border-b ${
              theme === "dark" 
                ? "border-slate-700/50" 
                : "border-slate-200/50"
            }`}
          >
            {/* Premium Collapse Button */}
            <button
              onClick={toggleSidebar}
              className={`
                absolute -right-3 top-1/2 -translate-y-1/2
                hidden lg:flex items-center justify-center
                w-6 h-12 rounded-full transition-all duration-500
                shadow-lg backdrop-blur-lg border
                hover:scale-110 hover:shadow-xl
                ${theme === "dark"
                  ? "bg-slate-700/80 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
                  : "bg-white/80 border-slate-300 text-slate-600 hover:bg-white hover:text-slate-900"
                }
              `}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* ENHANCED Logo Area */}
            <div className={`
              transition-all duration-500
              ${sidebarCollapsed ? "scale-90 opacity-80" : "scale-100 opacity-100"}
            `}>
              {sidebarCollapsed ? (
                // Collapsed Logo - Icon Only
                <div className="flex justify-center">
                  <div className={`
                    relative w-12 h-12 rounded-2xl flex items-center justify-center
                    bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600
                    shadow-2xl shadow-blue-500/30
                    transition-all duration-500 hover:scale-110 hover:rotate-12
                  `}>
                    <Activity className="w-6 h-6 text-white" />
                    <div className="absolute -top-1 -right-1">
                      <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              ) : (
                // Expanded Logo - Full Branding
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className={`
                    relative w-12 h-12 rounded-2xl flex items-center justify-center
                    bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600
                    shadow-2xl shadow-blue-500/25
                    transition-all duration-500 group-hover:scale-110 group-hover:rotate-12
                  `}>
                    <Activity className="w-6 h-6 text-white" />
                    <div className="absolute -top-1 -right-1">
                      <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h1 className={`
                      text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent
                      transition-all duration-500
                    `}>
                      BuzzTrack
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`
                        text-xs font-bold tracking-wide uppercase
                        ${theme === "dark" ? "text-slate-400" : "text-slate-500"}
                      `}>
                        Premium Analytics
                      </p>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Premium Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`
                    group relative flex items-center gap-4 px-4 py-3 rounded-2xl 
                    transition-all duration-300 ease-out
                    border backdrop-blur-sm
                    ${
                      isActive
                        ? theme === "dark"
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30 shadow-lg shadow-blue-500/10"
                          : "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-blue-200 shadow-lg shadow-blue-500/5"
                        : theme === "dark"
                        ? "text-slate-300 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 hover:text-white hover:scale-105"
                        : "text-slate-600 border-slate-200/50 hover:bg-white/80 hover:border-slate-300 hover:text-slate-900 hover:scale-105"
                    }
                  `}
                >
                  {/* Animated Icon */}
                  <div className={`
                    relative flex items-center justify-center
                    transition-transform duration-300
                    ${isActive ? "scale-110" : "group-hover:scale-110"}
                  `}>
                    <Icon className="w-5 h-5" />
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    )}
                  </div>

                  {/* Navigation Text */}
                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-medium">{item.name}</span>
                      
                      {/* Premium Badges */}
                      {item.badge && (
                        <span className={`
                          px-2 py-1 text-xs font-bold rounded-full border
                          ${item.badge === "live" 
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
                            : "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400"
                          }
                        `}>
                          {item.badge === "live" ? "LIVE" : "PRO"}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Premium Tooltip when collapsed */}
                  {sidebarCollapsed && (
                    <div
                      className={`
                        absolute left-full ml-3 px-3 py-2 text-sm font-medium rounded-xl
                        opacity-0 group-hover:opacity-100 transition-all duration-300
                        pointer-events-none z-50 whitespace-nowrap shadow-2xl backdrop-blur-lg
                        ${theme === "dark"
                          ? "bg-slate-700/90 text-white border border-slate-600/50"
                          : "bg-white/90 text-slate-900 border border-slate-200/50"
                        }
                        transform translate-x-2 group-hover:translate-x-0
                      `}
                    >
                      {item.name}
                      {item.badge && (
                        <span className="ml-2 text-xs opacity-80">• {item.badge}</span>
                      )}
                    </div>
                  )}

                  {/* Active Indicator Glow */}
                  {isActive && (
                    <div className={`
                      absolute inset-0 rounded-2xl opacity-20
                      bg-gradient-to-r from-blue-500 to-purple-500
                      -z-10
                    `} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Premium Sidebar Footer */}
          <div
            className={`p-6 border-t ${
              theme === "dark" 
                ? "border-slate-700/50" 
                : "border-slate-200/50"
            }`}
          >
            {/* Premium Upgrade Card (visible when expanded) */}
            {!sidebarCollapsed && (
              <div className={`
                mb-4 p-4 rounded-2xl border backdrop-blur-lg text-center
                bg-gradient-to-br from-amber-500/10 to-orange-500/10
                border-amber-500/20
                hover:scale-105 transition-transform duration-300 cursor-pointer
              `}>
                <Crown className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">
                  Upgrade to Pro
                </p>
                <p className="text-xs text-amber-500/80 dark:text-amber-400/80">
                  Unlock advanced features
                </p>
              </div>
            )}

            {/* Collapsed Crown Icon */}
            {sidebarCollapsed && (
              <div className="flex justify-center mb-4">
                <div className={`
                  p-3 rounded-xl
                  bg-gradient-to-br from-amber-500/10 to-orange-500/10
                  border border-amber-500/20
                  hover:scale-110 transition-transform duration-300 cursor-pointer
                `}>
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            )}

            {/* Show Tour button */}
            <button
              onClick={() => setShowOnboarding(true)}
              className={`
                w-full flex items-center justify-center gap-2 p-3 rounded-xl
                transition-all duration-300 hover:scale-105
                ${theme === "dark"
                  ? "text-slate-400 hover:text-purple-400 hover:bg-slate-700/50"
                  : "text-slate-500 hover:text-purple-600 hover:bg-slate-100/50"
                }
              `}
            >
              <Sparkles className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-sm font-medium">Show Tour</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Premium Main Layout */}
      <div
        className={`transition-all duration-500 ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        {/* Premium Header */}
        <header
          className={`
            sticky top-0 z-40 backdrop-blur-xl border-b
            ${theme === "dark"
              ? "bg-slate-800/80 border-slate-700/50"
              : "bg-white/80 border-slate-200/50"
            }
            shadow-lg
          `}
        >
          <div className="flex items-center justify-between px-6 lg:px-8 py-4">
            {/* Premium Logo Section - Mobile */}
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger */}
              <button
                onClick={toggleMobileSidebar}
                className={`
                  lg:hidden p-2 rounded-xl transition-all duration-300
                  hover:scale-110 hover:shadow-lg
                  ${theme === "dark"
                    ? "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
                  }
                `}
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Mobile Logo - Only show on mobile when sidebar closed */}
              <div className="flex lg:hidden items-center gap-3 group cursor-pointer">
                <div className={`
                  relative w-10 h-10 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600
                  shadow-xl shadow-blue-500/25
                  transition-all duration-500 group-hover:scale-110 group-hover:rotate-12
                `}>
                  <Activity className="w-5 h-5 text-white" />
                  <div className="absolute -top-0.5 -right-0.5">
                    <Zap className="w-2.5 h-2.5 text-yellow-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    BuzzTrack
                  </h1>
                  <p className={`text-xs font-bold ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Premium
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Right Section */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {/* Premium Status Badge */}
              <div className={`
                hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl
                border backdrop-blur-sm
                ${theme === "dark"
                  ? "bg-slate-700/50 border-slate-600/50 text-slate-300"
                  : "bg-white/50 border-slate-200/50 text-slate-600"
                }
              `}>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Premium Main Content */}
        <main className="animate-in fade-in duration-500">
          <Outlet />
        </main>
      </div>

      {/* Premium Onboarding Tour */}
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