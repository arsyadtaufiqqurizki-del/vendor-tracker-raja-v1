import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Vendor, ProspectiveVendor } from '../types';
import { supabase } from '../lib/supabase';

interface VendorContextType {
  vendors: Vendor[];
  prospectiveVendors: ProspectiveVendor[];
  loading: boolean;
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

// Vendor row <-> DB row (public.vendors uses snake_case columns).
const vendorFromRow = (row: any): Vendor => {
  const vendor: Vendor = {
    id: row.id,
    name: row.name,
    category: row.category,
    subCategory: row.sub_category,
    phone: row.phone,
    email: row.email,
    salesPerson: row.sales_person,
    documents: row.documents ?? {},
    bankName: row.bank_name,
    bankAccountName: row.bank_account_name,
    bankAccount: row.bank_account,
    npwpNumber: row.npwp_number,
    nibAddress: row.nib_address,
    correspAddress: row.corresp_address,
    remarks: row.remarks,
    icon: row.icon ?? undefined,
    status: '',
    statusColor: '',
    dotColor: '',
  };
  return { ...vendor, ...calculateCompliance(vendor.documents) };
};

const vendorToRow = (vendor: Vendor) => ({
  id: vendor.id,
  name: vendor.name,
  category: vendor.category,
  sub_category: vendor.subCategory,
  phone: vendor.phone,
  email: vendor.email,
  sales_person: vendor.salesPerson,
  documents: vendor.documents,
  bank_name: vendor.bankName,
  bank_account_name: vendor.bankAccountName,
  bank_account: vendor.bankAccount,
  npwp_number: vendor.npwpNumber,
  nib_address: vendor.nibAddress,
  corresp_address: vendor.correspAddress,
  remarks: vendor.remarks,
  icon: vendor.icon ?? null,
});

const prospectiveFromRow = (row: any): ProspectiveVendor => ({
  id: row.id,
  name: row.name,
  contactEmail: row.contact_email,
  contactPerson: row.contact_person ?? undefined,
  whatsapp: row.whatsapp ?? undefined,
  category: row.category,
  status: row.status,
});

const prospectiveToRow = (vendor: ProspectiveVendor) => ({
  id: vendor.id,
  name: vendor.name,
  contact_email: vendor.contactEmail,
  contact_person: vendor.contactPerson ?? null,
  whatsapp: vendor.whatsapp ?? null,
  category: vendor.category,
  status: vendor.status,
});

export function VendorProvider({ children }: { children: ReactNode }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [prospectiveVendors, setProspectiveVendors] = useState<ProspectiveVendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [vendorsRes, prospectiveRes] = await Promise.all([
        supabase.from('vendors').select('*').order('created_at', { ascending: false }),
        supabase.from('prospective_vendors').select('*').order('created_at', { ascending: false }),
      ]);

      if (vendorsRes.error) {
        console.error('Failed to load vendors:', vendorsRes.error);
      } else {
        setVendors((vendorsRes.data ?? []).map(vendorFromRow));
      }

      if (prospectiveRes.error) {
        console.error('Failed to load prospective vendors:', prospectiveRes.error);
      } else {
        setProspectiveVendors((prospectiveRes.data ?? []).map(prospectiveFromRow));
      }

      setLoading(false);
    })();
  }, []);

  const updateVendor = (updatedVendor: Vendor) => {
    const newStatus = calculateCompliance(updatedVendor.documents);
    const vendorWithStatus = { ...updatedVendor, ...newStatus };
    setVendors(vendors.map(v => v.id === vendorWithStatus.id ? vendorWithStatus : v));

    supabase.from('vendors').update(vendorToRow(vendorWithStatus)).eq('id', vendorWithStatus.id)
      .then(({ error }) => { if (error) console.error('Failed to update vendor:', error); });
  };

  const addVendor = (newVendor: Vendor) => {
    const newStatus = calculateCompliance(newVendor.documents);
    const vendorWithStatus = { ...newVendor, ...newStatus };
    setVendors([vendorWithStatus, ...vendors]);

    supabase.from('vendors').insert(vendorToRow(vendorWithStatus))
      .then(({ error }) => { if (error) console.error('Failed to add vendor:', error); });
  };

  const deleteVendor = (id: string) => {
    setVendors(vendors.filter(v => v.id !== id));

    supabase.from('vendors').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('Failed to delete vendor:', error); });
  };

  const addProspectiveVendor = (vendor: ProspectiveVendor) => {
    setProspectiveVendors([vendor, ...prospectiveVendors]);

    supabase.from('prospective_vendors').insert(prospectiveToRow(vendor))
      .then(({ error }) => { if (error) console.error('Failed to add prospective vendor:', error); });
  };

  const updateProspectiveVendor = (updatedVendor: ProspectiveVendor) => {
    setProspectiveVendors(prospectiveVendors.map(v => v.id === updatedVendor.id ? updatedVendor : v));

    supabase.from('prospective_vendors').update(prospectiveToRow(updatedVendor)).eq('id', updatedVendor.id)
      .then(({ error }) => { if (error) console.error('Failed to update prospective vendor:', error); });
  };

  const deleteProspectiveVendor = (id: string) => {
    setProspectiveVendors(prospectiveVendors.filter(v => v.id !== id));

    supabase.from('prospective_vendors').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('Failed to delete prospective vendor:', error); });
  };

  return (
    <VendorContext.Provider value={{ vendors, prospectiveVendors, loading, updateVendor, addVendor, deleteVendor, addProspectiveVendor, updateProspectiveVendor, deleteProspectiveVendor, calculateCompliance }}>
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
