import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import OverviewPage from './pages/OverviewPage';
import ReviewsPage from './pages/ReviewsPage';
import ScraperPage from './pages/ScraperPage';
import InsightsPage from './pages/InsightsPage';
import ReputationPage from './pages/ReputationPage';
import HotelOSPage from './pages/HotelOSPage';
import SubscriptionPage from './pages/SubscriptionPage';
import { AppProvider } from './store/AppStore';

export default function App() {
  return (
    <AppProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="scraper" element={<ScraperPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="reputation" element={<ReputationPage />} />
          <Route path="hotelos" element={<HotelOSPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </AppProvider>
  );
}
