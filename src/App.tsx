import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Dashboard } from './views/Dashboard';
import { Vendors } from './views/Vendors';
import { ProspectiveVendors } from './views/ProspectiveVendors';
import { Compliance } from './views/Compliance';
import { RequestForm } from './views/RequestForm';
import { Settings } from './views/Settings';
import { UserGuide } from './views/UserGuide';
import { Login } from './views/Login';
import { ViewType, Vendor } from './types';
import { VendorProvider, useVendors } from './contexts/VendorContext';
import { VendorModal } from './components/VendorModal';
import { supabase } from './lib/supabase';

function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const { addVendor } = useVendors();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-surface-container-lowest">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const handleNewRequisition = () => {
    setIsRequisitionModalOpen(true);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'vendors':
        return <Vendors />;
      case 'prospectiveVendors':
        return <ProspectiveVendors />;
      case 'compliance':
        return <Compliance />;
      case 'requestForm':
        return <RequestForm />;
      case 'settings':
        return <Settings userEmail={session.user.email} onLogout={() => supabase.auth.signOut()} onNavigate={setCurrentView} />;
      case 'userGuide':
        return <UserGuide />;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'vendors': return 'Vendors';
      case 'prospectiveVendors': return 'Prospective Vendors';
      case 'compliance': return 'Compliance';
      case 'requestForm': return 'Request Form';
      case 'settings': return 'Settings';
      case 'userGuide': return 'Panduan Pengguna';
    }
  };

  const emptyVendor: Vendor = {
    id: `V-${Math.floor(10000 + Math.random() * 90000)}`,
    name: '', category: '', subCategory: '', phone: '', email: '', salesPerson: '',
    documents: { 'NIB': '', 'Akta Pendirian': '', 'Akta Pengesahan': '', 'NPWP': '', 'PKP': '', 'Non PKP': '', 'Sertifikat': '', 'Dokumen Pendukung': '', 'Registration Form RAJA': '' },
    bankName: '', bankAccountName: '', bankAccount: '', npwpNumber: '', nibAddress: '', correspAddress: '', remarks: '',
    status: '', statusColor: '', dotColor: '', createdAt: new Date().toISOString()
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar 
        currentView={currentView} 
        onViewChange={(view) => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNewRequisition={handleNewRequisition}
        onLogout={() => supabase.auth.signOut()}
      />
      
      <div className="flex-1 flex flex-col md:ml-[280px] min-w-0">
        <TopNav
          title={getTitle()}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          userEmail={session.user.email}
          onLogout={() => supabase.auth.signOut()}
          onNavigate={setCurrentView}
        />
        
        <main className="flex-1 overflow-y-auto p-md lg:p-lg no-scrollbar">
          <div className="max-w-[1440px] mx-auto">
            {renderView()}
          </div>
        </main>
      </div>

      {isRequisitionModalOpen && (
        <VendorModal 
          vendor={emptyVendor}
          viewMode="add"
          onClose={() => setIsRequisitionModalOpen(false)}
          onSave={(vendor) => {
            addVendor(vendor);
            setIsRequisitionModalOpen(false);
            setCurrentView('vendors');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <VendorProvider>
      <AppContent />
    </VendorProvider>
  );
}

