import { createContext, useContext, useState, ReactNode } from 'react';
import { Vendor, ProspectiveVendor } from '../types';

interface VendorContextType {
  vendors: Vendor[];
  prospectiveVendors: ProspectiveVendor[];
  updateVendor: (vendor: Vendor) => void;
  addVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;
  addProspectiveVendor: (vendor: ProspectiveVendor) => void;
  updateProspectiveVendor: (vendor: ProspectiveVendor) => void;
  deleteProspectiveVendor: (id: string) => void;
  calculateCompliance: (docs: Record<string, string>) => any;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export const calculateCompliance = (docs: Record<string, string>) => {
  const required = ['NIB', 'Akta Pendirian', 'Akta Pengesahan', 'NPWP'];
  const missing = required.find(doc => docs[doc] !== 'Yes');
  
  if (missing) {
    return { 
      status: `Missing ${missing}`, 
      statusColor: 'text-on-error-container bg-error-container/50', 
      dotColor: 'bg-error',
      error: true,
      color: 'bg-red-100 text-red-800 border-red-200'
    };
  }

  if (docs['PKP'] !== 'Yes' && docs['Non PKP'] !== 'Yes') {
    return { 
      status: 'Missing PKP/Non PKP', 
      statusColor: 'text-on-error-container bg-error-container/50', 
      dotColor: 'bg-error',
      error: true,
      color: 'bg-red-100 text-red-800 border-red-200'
    };
  }

  return { 
    status: 'Compliant', 
    statusColor: 'text-on-tertiary-container bg-tertiary-fixed/20', 
    dotColor: 'bg-on-tertiary-container',
    error: false,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };
};

const initialVendors: Vendor[] = [];

const initialProspectiveVendors: ProspectiveVendor[] = [];

export function VendorProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [prospectiveVendors, setProspectiveVendors] = useState<ProspectiveVendor[]>(initialProspectiveVendors);

  const updateVendor = (updatedVendor: Vendor) => {
    const newStatus = calculateCompliance(updatedVendor.documents);
    const vendorWithStatus = { ...updatedVendor, ...newStatus };
    setVendors(vendors.map(v => v.id === vendorWithStatus.id ? vendorWithStatus : v));
  };

  const addVendor = (newVendor: Vendor) => {
    const newStatus = calculateCompliance(newVendor.documents);
    const vendorWithStatus = { ...newVendor, ...newStatus };
    setVendors([vendorWithStatus, ...vendors]);
  };

  const deleteVendor = (id: string) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

  const addProspectiveVendor = (vendor: ProspectiveVendor) => {
    setProspectiveVendors([vendor, ...prospectiveVendors]);
  };

  const updateProspectiveVendor = (updatedVendor: ProspectiveVendor) => {
    setProspectiveVendors(prospectiveVendors.map(v => v.id === updatedVendor.id ? updatedVendor : v));
  };

  const deleteProspectiveVendor = (id: string) => {
    setProspectiveVendors(prospectiveVendors.filter(v => v.id !== id));
  };

  return (
    <VendorContext.Provider value={{ vendors, prospectiveVendors, updateVendor, addVendor, deleteVendor, addProspectiveVendor, updateProspectiveVendor, deleteProspectiveVendor, calculateCompliance }}>
      {children}
    </VendorContext.Provider>
  );
}

export function useVendors() {
  const context = useContext(VendorContext);
  if (context === undefined) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
}
