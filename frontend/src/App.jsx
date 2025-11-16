import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/UI/Toast';
import DashboardLayout from './components/Dashboard/DashboardLayout';
import Home from './pages/Home';
import BrandDetail from './pages/BrandDetail';
import Analytics from './pages/Analytics';
import Topics from './pages/Topics';
import './App.css'
import { SocketProvider } from './context/SocketContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <ThemeProvider>
            <ToastProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<DashboardLayout />}>
                    <Route index element={<Home />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="topics" element={<Topics />} />
                  </Route>
                </Routes>
              </BrowserRouter>
              <ToastContainer />
            </ToastProvider>
          </ThemeProvider>
        </SocketProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}