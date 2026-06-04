import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import useAuthStore from './store/useAuthStore';
import useTripStore from './store/useTripStore';

// Platform pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Trip module
import TripListPage from './modules/trip/pages/TripListPage';
import TripDetailPage from './modules/trip/pages/TripDetailPage';
import TripOverviewPage from './modules/trip/pages/TripOverviewPage';
import ExpensePage from './modules/trip/pages/ExpensePage';

// Hotel module — customer
import HotelHomePage from './modules/hotel/pages/customer/HotelHomePage';
import PropertiesPage from './modules/hotel/pages/customer/PropertiesPage';
import PropertyDetailPage from './modules/hotel/pages/customer/PropertyDetailPage';
import HotelBookingPage from './modules/hotel/pages/customer/BookingPage';
import BookingSuccessPage from './modules/hotel/pages/customer/BookingSuccessPage';
import HotelOrdersPage from './modules/hotel/pages/customer/OrdersPage';
import FavoritesPage from './modules/hotel/pages/customer/FavoritesPage';
import CartPage from './modules/hotel/pages/customer/CartPage';
import ChatPage from './modules/hotel/pages/customer/ChatPage';

// Hotel module — admin
import AdminLayout from './modules/hotel/pages/admin/AdminLayout';
import DashboardPage from './modules/hotel/pages/admin/DashboardPage';
import AdminPropertiesPage from './modules/hotel/pages/admin/AdminPropertiesPage';
import AdminInventoryPage from './modules/hotel/pages/admin/AdminInventoryPage';
import AdminPricingPage from './modules/hotel/pages/admin/AdminPricingPage';
import AdminDiscountsPage from './modules/hotel/pages/admin/AdminDiscountsPage';
import AdminOrdersPage from './modules/hotel/pages/admin/AdminOrdersPage';
import AdminAdsPage from './modules/hotel/pages/admin/AdminAdsPage';
import AdminRefundsPage from './modules/hotel/pages/admin/AdminRefundsPage';
import AdminAccountsPage from './modules/hotel/pages/admin/AdminAccountsPage';
import AdminPricingRulesPage from './modules/hotel/pages/admin/AdminPricingRulesPage';
import AdminPropertiesApprovalPage from './modules/hotel/pages/admin/AdminPropertiesApprovalPage';

// Hotel module — host
import HostLayout from './modules/hotel/pages/host/HostLayout';
import HostDashboardPage from './modules/hotel/pages/host/HostDashboardPage';
import HostOrdersPage from './modules/hotel/pages/host/HostOrdersPage';
import HostPropertiesPage from './modules/hotel/pages/host/HostPropertiesPage';
import HostPropertyFormPage from './modules/hotel/pages/host/HostPropertyFormPage';
import HostPropertyViewPage from './modules/hotel/pages/host/HostPropertyViewPage';
import HostRoomsPage from './modules/hotel/pages/host/HostRoomsPage';
import HostDiscountsPage from './modules/hotel/pages/host/HostDiscountsPage';
import HostPricingPage from './modules/hotel/pages/host/HostPricingPage';

// Train module
import TrainHomePage from './modules/train/pages/TrainHomePage';
import SearchResultsPage from './modules/train/pages/SearchResultsPage';
import TrainBookingPage from './modules/train/pages/BookingPage';
import PaymentPage from './modules/train/pages/PaymentPage';
import PaymentResultPage from './modules/train/pages/PaymentResultPage';
import TrainOrdersPage from './modules/train/pages/OrdersPage';
import TicketPage from './modules/train/pages/TicketPage';

function RequireAuth({ children }) {
  const { currentUser } = useAuthStore();
  return currentUser ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function RequireHost({ children }) {
  const { currentUser } = useAuthStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'host' && currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

function ShareRedirect() {
  const { token } = useParams();
  const { currentUser } = useAuthStore();
  const { joinTrip } = useTripStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  joinTrip(token);
  return <Navigate to="/trip" replace />;
}

export default function App() {
  return (
    <BrowserRouter basename="/booking-project">
      <ToastProvider>
        <div className="app">
          <Navbar />
          <div className="app-content">
            <Routes>
              {/* Platform */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
              <Route path="/profile/:tab" element={<RequireAuth><ProfilePage /></RequireAuth>} />

              {/* Trip module */}
              <Route path="/trip" element={<RequireAuth><TripListPage /></RequireAuth>} />
              <Route path="/trip/:id" element={<RequireAuth><TripDetailPage /></RequireAuth>} />
              <Route path="/trip/:id/overview" element={<RequireAuth><TripOverviewPage /></RequireAuth>} />
              <Route path="/trip/:id/expenses" element={<RequireAuth><ExpensePage /></RequireAuth>} />
              <Route path="/trip/share/:token" element={<ShareRedirect />} />

              {/* Hotel module */}
              <Route path="/hotel" element={<HotelHomePage />} />
              <Route path="/hotel/properties" element={<PropertiesPage />} />
              <Route path="/hotel/property/:id" element={<PropertyDetailPage />} />
              <Route path="/hotel/booking" element={<RequireAuth><HotelBookingPage /></RequireAuth>} />
              <Route path="/hotel/booking/success" element={<RequireAuth><BookingSuccessPage /></RequireAuth>} />
              <Route path="/hotel/orders" element={<RequireAuth><HotelOrdersPage /></RequireAuth>} />
              <Route path="/hotel/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
              <Route path="/hotel/cart" element={<CartPage />} />
              <Route path="/hotel/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />

              {/* Train module */}
              <Route path="/ticket" element={<TrainHomePage />} />
              <Route path="/ticket/search" element={<SearchResultsPage />} />
              <Route path="/ticket/booking" element={<RequireAuth><TrainBookingPage /></RequireAuth>} />
              <Route path="/ticket/payment/:orderId" element={<RequireAuth><PaymentPage /></RequireAuth>} />
              <Route path="/ticket/payment-result/:orderId" element={<RequireAuth><PaymentResultPage /></RequireAuth>} />
              <Route path="/ticket/orders" element={<RequireAuth><TrainOrdersPage /></RequireAuth>} />
              <Route path="/ticket/ticket/:orderId" element={<RequireAuth><TicketPage /></RequireAuth>} />

              {/* Admin */}
              <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                <Route index element={<DashboardPage />} />
                <Route path="properties" element={<AdminPropertiesPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="pricing" element={<AdminPricingPage />} />
                <Route path="discounts" element={<AdminDiscountsPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="ads" element={<AdminAdsPage />} />
                <Route path="refunds" element={<AdminRefundsPage />} />
                <Route path="approval" element={<AdminPropertiesApprovalPage />} />
                <Route path="accounts" element={<AdminAccountsPage />} />
                <Route path="pricing-rules" element={<AdminPricingRulesPage />} />
              </Route>

              {/* Host */}
              <Route path="/host" element={<RequireHost><HostLayout /></RequireHost>}>
                <Route index element={<HostDashboardPage />} />
                <Route path="orders" element={<HostOrdersPage />} />
                <Route path="properties" element={<HostPropertiesPage />} />
                <Route path="properties/new" element={<HostPropertyFormPage />} />
                <Route path="properties/:id/view" element={<HostPropertyViewPage />} />
                <Route path="properties/:id/edit" element={<HostPropertyFormPage />} />
                <Route path="rooms/:propId" element={<HostRoomsPage />} />
                <Route path="discounts" element={<HostDiscountsPage />} />
                <Route path="pricing/:propId" element={<HostPricingPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}
