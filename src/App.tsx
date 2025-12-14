import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const HimalayanMapPage = lazy(() => import('./pages/HimalayanMapPage'));
const LocationDetailsPage = lazy(() => import('./pages/LocationDetailsPage'));
const StatsDashboard = lazy(() => import('./pages/StatsDashboard'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white/60 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<HimalayanMapPage />} />
            <Route path="/locations/:id" element={<LocationDetailsPage />} />
            <Route path="/research" element={<StatsDashboard />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
