import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Vendor } from '../types';

interface VendorModalProps {
  vendor: Vendor;
  viewMode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave: (vendor: Vendor) => void;
}

export function VendorModal({ vendor: initialVendor, viewMode, onClose, onSave }: VendorModalProps) {
  const [vendor, setVendor] = useState<Vendor>(initialVendor);

  useEffect(() => {
    setVendor(initialVendor);
  }, [initialVendor]);

  const handleDocumentChange = (docName: string, value: string) => {
    setVendor(prev => ({
      ...prev,
      documents: { ...prev.documents, [docName]: value }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="p-lg border-b border-outline-variant flex justify-between items-start sticky top-0 bg-surface-container-lowest z-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">
              {viewMode === 'add' ? 'Tambah Vendor Baru' : vendor.name}
            </h2>
            {viewMode !== 'add' && (
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">{vendor.category} • {vendor.subCategory}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-lg flex flex-col gap-xl">
          {/* Informasi Dasar */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">1. Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="md:col-span-2">
                <label className="block font-label-md text-on-surface-variant mb-1">Nama Vendor</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                  value={vendor.name} 
                  onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Kategori</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                  value={vendor.category} 
                  onChange={(e) => setVendor({ ...vendor, category: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Sub Kategori</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                  value={vendor.subCategory} 
                  onChange={(e) => setVendor({ ...vendor, subCategory: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Sales Person</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                  value={vendor.salesPerson} 
                  onChange={(e) => setVendor({ ...vendor, salesPerson: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">No. HP</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                  value={vendor.phone} 
                  onChange={(e) => setVendor({ ...vendor, phone: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Email</label>
                <input 
                  type="email" 
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                  value={vendor.email} 
                  onChange={(e) => setVendor({ ...vendor, email: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </div>
            </div>
          </section>

          {/* Dokumen Administrasi */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">2. Dokumen Administrasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {['NIB', 'Akta Pendirian', 'Akta Pengesahan', 'NPWP', 'PKP', 'Non PKP', 'Sertifikat', 'Dokumen Pendukung', 'Registration Form RAJA'].map((doc) => (
                <div key={doc} className="flex items-center justify-between bg-surface-bright border border-outline-variant rounded-lg p-3">
                  <span className="font-body-md text-on-surface font-medium">{doc}</span>
                  <div className="flex items-center gap-sm">
                    <select 
                      className="bg-surface border border-outline-variant rounded px-2 py-1 font-body-sm text-on-surface outline-none focus:border-secondary disabled:opacity-70 disabled:bg-surface-container"
                      value={vendor.documents[doc]}
                      onChange={(e) => handleDocumentChange(doc, e.target.value)}
                      disabled={viewMode === 'view'}
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                    {(viewMode === 'edit' || viewMode === 'add') && (
                      <button className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded text-on-surface text-body-sm transition-colors">
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rekening Bank */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">3. Informasi Rekening Bank</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Nama Bank</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                  value={vendor.bankName} 
                  onChange={(e) => setVendor({ ...vendor, bankName: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Nomor Rekening</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                  value={vendor.bankAccount} 
                  onChange={(e) => setVendor({ ...vendor, bankAccount: e.target.value })}
                  disabled={viewMode === 'view'}
                />
              </div>
            </div>
          </section>

          {/* NPWP */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">4. Informasi Pajak</h3>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1">No. NPWP</label>
              <input 
                type="text" 
                className="w-full md:w-1/2 bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                value={vendor.npwpNumber} 
                onChange={(e) => setVendor({ ...vendor, npwpNumber: e.target.value })}
                disabled={viewMode === 'view'}
              />
            </div>
          </section>

          {/* Alamat */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">5. Informasi Alamat</h3>
            <div className="flex flex-col gap-md">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Alamat Perusahaan Berdasarkan NIB</label>
                <textarea 
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors min-h-[80px] resize-y disabled:opacity-70 disabled:bg-surface-container" 
                  value={vendor.nibAddress}
                  onChange={(e) => setVendor({ ...vendor, nibAddress: e.target.value })}
                  disabled={viewMode === 'view'}
                ></textarea>
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Alamat Korespondensi</label>
                <textarea 
                  className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors min-h-[80px] resize-y disabled:opacity-70 disabled:bg-surface-container" 
                  value={vendor.correspAddress}
                  onChange={(e) => setVendor({ ...vendor, correspAddress: e.target.value })}
                  disabled={viewMode === 'view'}
                ></textarea>
              </div>
            </div>
          </section>

          {/* Remarks */}
          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">6. Remarks</h3>
            <div>
              <textarea 
                className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors min-h-[100px] resize-y disabled:opacity-70 disabled:bg-surface-container" 
                placeholder="Tambahkan catatan untuk vendor ini..."
                value={vendor.remarks}
                onChange={(e) => setVendor({ ...vendor, remarks: e.target.value })}
                disabled={viewMode === 'view'}
              ></textarea>
            </div>
          </section>
        </div>
        
        <div className="p-lg border-t border-outline-variant bg-surface-container-lowest sticky bottom-0 flex justify-end gap-md z-10 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-low transition-colors font-medium">{viewMode === 'view' ? 'Tutup' : 'Batal'}</button>
          {(viewMode === 'edit' || viewMode === 'add') && (
            <button onClick={() => onSave(vendor)} className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors font-medium">
              {viewMode === 'add' ? 'Tambah Vendor' : 'Simpan Perubahan'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
