import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Dashboard } from './views/Dashboard';
import { Vendors } from './views/Vendors';
import { ProspectiveVendors } from './views/ProspectiveVendors';
import { Compliance } from './views/Compliance';
import { Login } from './views/Login';
import { ViewType, Vendor } from './types';
import { VendorProvider, useVendors } from './contexts/VendorContext';
import { VendorModal } from './components/VendorModal';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const { addVendor } = useVendors();

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
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
    }
  };

  const emptyVendor: Vendor = {
    id: `V-${Math.floor(10000 + Math.random() * 90000)}`,
    name: '', category: '', subCategory: '', phone: '', email: '', salesPerson: '',
    documents: { 'NIB': 'No', 'Akta Pendirian': 'No', 'Akta Pengesahan': 'No', 'NPWP': 'No', 'PKP': 'No', 'Non PKP': 'No', 'Sertifikat': 'No', 'Dokumen Pendukung': 'No', 'Registration Form RAJA': 'No' },
    bankName: '', bankAccountName: '', bankAccount: '', npwpNumber: '', nibAddress: '', correspAddress: '', remarks: '',
    status: '', statusColor: '', dotColor: ''
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
        onLogout={() => setIsAuthenticated(false)}
      />
      
      <div className="flex-1 flex flex-col md:ml-[280px] min-w-0">
        <TopNav 
          title={getTitle()} 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
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

