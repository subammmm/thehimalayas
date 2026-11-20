import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePageTitle } from './hooks/usePageTitle';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const HimalayanMapPage = lazy(() => import('./pages/HimalayanMapPage'));
const LocationDetailsPage = lazy(() => import('./pages/LocationDetailsPage'));
const StatsDashboard = lazy(() => import('./pages/StatsDashboard'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const DataPage = lazy(() => import('./pages/DataPage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const EmbedPage = lazy(() => import('./pages/EmbedPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white/60 font-medium">Loading...</p>
    </div>
  </div>
);

const NotFound = () => {
  usePageTitle('Page not found');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <Link to="/" className="text-amber-400 hover:underline">Return home</Link>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<HimalayanMapPage />} />
            <Route path="/locations/:id" element={<LocationDetailsPage />} />
            <Route path="/atlas" element={<StatsDashboard />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/embed" element={<EmbedPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
