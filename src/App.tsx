import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import ReviewsPage from './pages/ReviewsPage';
import ScraperPage from './pages/ScraperPage';
import InsightsPage from './pages/InsightsPage';
import ReputationPage from './pages/ReputationPage';
import HotelOSPage from './pages/HotelOSPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/reviews" replace />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="scraper" element={<ScraperPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="reputation" element={<ReputationPage />} />
          <Route path="hotelos" element={<HotelOSPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
