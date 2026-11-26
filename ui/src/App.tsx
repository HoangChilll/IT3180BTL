import React, { useState } from 'react';
import { BlueMoonProvider, useBlueMoonStore } from './store/useBlueMoonStore';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './components/layout/AppShell';
import { PageKey } from './types';
import { canAccessPage } from './utils/permissions';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ApartmentsPage } from './pages/ApartmentsPage';
import { ResidentsPage } from './pages/ResidentsPage';
import { ResidencyEventsPage } from './pages/ResidencyEventsPage';
import { FeeConfigPage } from './pages/FeeConfigPage';
import { BillingPage } from './pages/BillingPage';
import { CollectionPage } from './pages/CollectionPage';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DonationsReportPage } from './pages/DonationsReportPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { UtilitiesPage } from './pages/UtilitiesPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';

const PortalRouter: React.FC = () => {
  const { currentUser } = useBlueMoonStore();
  const [activePage, setActivePage] = useState<PageKey>('dashboard');
  const [focusApartmentCode, setFocusApartmentCode] = useState<string>('');

  // US-01 AC5: Block all management routes when unauthenticated
  if (!currentUser) {
    return <LoginPage />;
  }

  const handleNavigate = (page: PageKey, extra?: { apartmentCode?: string }) => {
    if (!canAccessPage(currentUser.role, page)) return;
    setFocusApartmentCode(extra?.apartmentCode || '');
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const effectivePage: PageKey = canAccessPage(currentUser.role, activePage)
    ? activePage
    : 'dashboard';

  const renderPage = () => {
    switch (effectivePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'apartments':
        return <ApartmentsPage initialSearch={focusApartmentCode} />;
      case 'residents':
        return <ResidentsPage />;
      case 'residency-events':
        return <ResidencyEventsPage />;
      case 'fee-config':
        return <FeeConfigPage />;
      case 'billing':
        return <BillingPage />;
      case 'collection':
        return <CollectionPage initialApartmentCode={focusApartmentCode} />;
      case 'receipts':
        return <ReceiptsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'donations-report':
        return <DonationsReportPage />;
      case 'vehicles':
        return <VehiclesPage />;
      case 'utilities':
        return <UtilitiesPage onNavigate={handleNavigate} />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppShell activePage={effectivePage} onNavigate={handleNavigate}>
      {renderPage()}
    </AppShell>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BlueMoonProvider>
        <PortalRouter />
      </BlueMoonProvider>
    </ToastProvider>
  );
};

export default App;
