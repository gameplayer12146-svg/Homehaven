import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastContainer } from './components/ui/Toast.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';

// Pages
import { Home } from './pages/Home.js';
import { Services } from './pages/Services.js';
import { ServiceDetail } from './pages/ServiceDetail.js';
import { ProviderList } from './pages/ProviderList.js';
import { BookingPage } from './pages/BookingPage.js';
import { MyBookings } from './pages/MyBookings.js';
import { BookingDetail } from './pages/BookingDetail.js';
import { HomeProfile } from './pages/HomeProfile.js';
import { CustomerDashboard } from './pages/customer/Dashboard.js';
import { ProviderDashboard } from './pages/provider/Dashboard.js';
import { ManageAvailability } from './pages/provider/ManageAvailability.js';
import { JobRequests } from './pages/provider/JobRequests.js';
import { AdminDashboard } from './pages/admin/Dashboard.js';
import { ManageServices } from './pages/admin/ManageServices.js';
import { ManageProviders } from './pages/admin/ManageProviders.js';
import { ManageBookings } from './pages/admin/ManageBookings.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [tabParam, setTabParam] = useState<any>(null);

  const navigate = (tab: string, param?: any) => {
    setCurrentTab(tab);
    setTabParam(param || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home onNavigate={navigate} />;

      case 'services':
        return <Services onNavigate={navigate} initialFilter={typeof tabParam === 'string' ? tabParam : undefined} />;

      case 'service-detail':
        return <ServiceDetail serviceId={tabParam} onNavigate={navigate} />;

      case 'providers':
        return <ProviderList onNavigate={navigate} />;

      case 'book':
        return (
          <BookingPage
            initialServiceId={tabParam?.serviceId}
            initialProviderId={tabParam?.providerId}
            onNavigate={navigate}
          />
        );

      case 'my-bookings':
        return <MyBookings onNavigate={navigate} />;

      case 'booking-detail':
        return <BookingDetail bookingId={tabParam} onNavigate={navigate} />;

      case 'home-profile':
        return <HomeProfile onNavigate={navigate} />;

      case 'customer-dashboard':
        return <CustomerDashboard onNavigate={navigate} />;

      case 'provider-dashboard':
        return <ProviderDashboard onNavigate={navigate} />;

      case 'provider-availability':
        return <ManageAvailability onNavigate={navigate} />;

      case 'provider-jobs':
        return <JobRequests onNavigate={navigate} />;

      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigate} />;

      case 'admin-services':
        return <ManageServices onNavigate={navigate} />;

      case 'admin-providers':
        return <ManageProviders onNavigate={navigate} />;

      case 'admin-bookings':
        return <ManageBookings onNavigate={navigate} />;

      case 'login':
        return <Login onNavigate={navigate} />;

      case 'register':
        return <Register onNavigate={navigate} />;

      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7F0] text-[#1A1A2E]">
      <ToastContainer />
      <Navbar currentTab={currentTab} onNavigate={navigate} />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
