import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { TenantProvider } from './context/TenantContext';
import { HomePage } from './pages/HomePage';
import { ClientBookingPage } from './pages/ClientBookingPage';
import { BookingStatusPage } from './pages/BookingStatusPage';
import { OwnerLoginPage } from './pages/OwnerLoginPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';

function TenantLayout() {
  return (
    <TenantProvider>
      <Outlet />
    </TenantProvider>
  );
}

export function App() {
  return (
    <Routes>
      {/* Root points directly to flagship studio */}
      <Route
        path="/"
        element={
          <TenantProvider defaultSlug="lumi-nail-studio">
            <ClientBookingPage />
          </TenantProvider>
        }
      />

      {/* Directory of all studios for multi-tenant exploration */}
      <Route path="/studios" element={<HomePage />} />

      {/* Tenant Scoped Routes */}
      <Route path="/s/:slug" element={<TenantLayout />}>
        {/* Client Booking Screen */}
        <Route index element={<ClientBookingPage />} />

        {/* Client Direct Appointment Access by Token */}
        <Route path="b/:token" element={<BookingStatusPage />} />

        {/* Owner Login and Portal */}
        <Route path="owner/login" element={<OwnerLoginPage />} />
        <Route path="owner" element={<OwnerDashboardPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
