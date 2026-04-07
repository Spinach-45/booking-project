import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import Navbar from './components/common/Navbar';
import HomePage from './pages/customer/HomePage';
import PropertiesPage from './pages/customer/PropertiesPage';
import PropertyDetailPage from './pages/customer/PropertyDetailPage';
import BookingPage from './pages/customer/BookingPage';
import BookingSuccessPage from './pages/customer/BookingSuccessPage';
import OrdersPage from './pages/customer/OrdersPage';
import FavoritesPage from './pages/customer/FavoritesPage';
import CartPage from './pages/customer/CartPage';
import ChatPage from './pages/customer/ChatPage';
import LoginPage from './pages/customer/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminPricingPage from './pages/admin/AdminPricingPage';
import AdminDiscountsPage from './pages/admin/AdminDiscountsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminAdsPage from './pages/admin/AdminAdsPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app">
          <Navbar />
          <div className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/property/:id" element={<PropertyDetailPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/booking/success" element={<BookingSuccessPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="properties" element={<AdminPropertiesPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="pricing" element={<AdminPricingPage />} />
                <Route path="discounts" element={<AdminDiscountsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="ads" element={<AdminAdsPage />} />
              </Route>
            </Routes>
          </div>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
