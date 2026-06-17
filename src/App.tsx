import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Public pages
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetail from './pages/RoomDetail';
import Food from './pages/Food';
import Attractions from './pages/Attractions';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

// Administrative pages
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import InquiryManagement from './pages/admin/InquiryManagement';
import RoomManagement from './pages/admin/RoomManagement';
import FoodManagement from './pages/admin/FoodManagement';
import AttractionManagement from './pages/admin/AttractionManagement';
import GalleryManagement from './pages/admin/GalleryManagement';
import SettingsManagement from './pages/admin/SettingsManagement';
import UserManagement from './pages/admin/UserManagement';
import BannerManagement from './pages/admin/BannerManagement';
import ShowcaseManagement from './pages/admin/ShowcaseManagement';
import ReviewManagement from './pages/admin/ReviewManagement';


// Shared Components
import Layout from './components/Layout';

// Initialize React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            {/* Guest Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:slug" element={<RoomDetail />} />
            <Route path="/food" element={<Food />} />
            <Route path="/attractions" element={<Attractions />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />

            {/* Administrative Portal */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/inquiries" element={<InquiryManagement />} />
            <Route path="/admin/rooms" element={<RoomManagement />} />
            <Route path="/admin/food" element={<FoodManagement />} />
            <Route path="/admin/attractions" element={<AttractionManagement />} />
            <Route path="/admin/gallery" element={<GalleryManagement />} />
            <Route path="/admin/settings" element={<SettingsManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/banners" element={<BannerManagement />} />
            <Route path="/admin/showcase" element={<ShowcaseManagement />} />
            <Route path="/admin/reviews" element={<ReviewManagement />} />

          </Routes>
        </Layout>
      </Router>
      <Toaster position="bottom-right" richColors closeButton />
    </QueryClientProvider>
  );
}
export default App;
