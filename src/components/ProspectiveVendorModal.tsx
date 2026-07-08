import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProspectiveVendor, ProspectiveStatus } from '../types';

interface ProspectiveVendorModalProps {
  onClose: () => void;
  onSave: (vendor: ProspectiveVendor) => void;
  vendorToEdit?: ProspectiveVendor | null;
}

export function ProspectiveVendorModal({ onClose, onSave, vendorToEdit }: ProspectiveVendorModalProps) {
  const [vendor, setVendor] = useState<Partial<ProspectiveVendor>>({
    name: '',
    contactEmail: '',
    contactPerson: '',
    whatsapp: '',
    category: '',
    status: 'New'
  });

  useEffect(() => {
    if (vendorToEdit) {
      setVendor(vendorToEdit);
    } else {
      setVendor({
        name: '',
        contactEmail: '',
        contactPerson: '',
        whatsapp: '',
        category: '',
        status: 'New'
      });
    }
  }, [vendorToEdit]);

  const handleSave = () => {
    if (vendor.name && vendor.contactEmail && vendor.category && vendor.status) {
      onSave({
        id: vendorToEdit?.id || `P-${Math.floor(1000 + Math.random() * 9000)}`,
        name: vendor.name,
        contactEmail: vendor.contactEmail,
        contactPerson: vendor.contactPerson,
        whatsapp: vendor.whatsapp,
        category: vendor.category,
        status: vendor.status as ProspectiveStatus,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-xl max-w-2xl w-full shadow-xl flex flex-col">
        <div className="p-lg border-b border-outline-variant flex justify-between items-center sticky top-0 bg-surface-container-lowest z-10 rounded-t-xl">
          <h2 className="font-headline-lg text-headline-lg text-primary">
            {vendorToEdit ? 'Edit Prospect' : 'Tambah Prospect Baru'}
          </h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-lg flex flex-col gap-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div className="md:col-span-2">
              <label className="block font-label-md text-on-surface-variant mb-1">Nama Vendor</label>
              <input 
                type="text" 
                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors" 
                value={vendor.name} 
                onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1">Email Kontak</label>
              <input 
                type="email" 
                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors" 
                value={vendor.contactEmail} 
                onChange={(e) => setVendor({ ...vendor, contactEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1">Contact Person</label>
              <input 
                type="text" 
                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors" 
                value={vendor.contactPerson || ''} 
                onChange={(e) => setVendor({ ...vendor, contactPerson: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1">Nomor WhatsApp</label>
              <input 
                type="text" 
                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors" 
                value={vendor.whatsapp || ''} 
                onChange={(e) => setVendor({ ...vendor, whatsapp: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1">Kategori</label>
              <input 
                type="text" 
                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors" 
                value={vendor.category} 
                onChange={(e) => setVendor({ ...vendor, category: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1">Status</label>
              <select 
                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
                value={vendor.status}
                onChange={(e) => setVendor({ ...vendor, status: e.target.value as ProspectiveStatus })}
              >
                <option value="New">New</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Converted">Converted</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-lg border-t border-outline-variant bg-surface-container-lowest sticky bottom-0 flex justify-end gap-md z-10 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-low transition-colors font-medium">Batal</button>
          <button 
            onClick={handleSave} 
            disabled={!vendor.name || !vendor.contactEmail || !vendor.category}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {vendorToEdit ? 'Simpan Perubahan' : 'Tambah Prospect'}
          </button>
        </div>
      </div>
    </div>
  );
}
