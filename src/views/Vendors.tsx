import { useRef, useState, ChangeEvent } from 'react';
import { UserPlus, Filter, Search, MoreVertical, ChevronLeft, ChevronRight, Store, CheckCircle, Hourglass, AlertTriangle, Eye, Edit2, Trash2, X, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { useVendors } from '../contexts/VendorContext';
import { Vendor } from '../types';
import { documentFileName, getVendorDocumentUrl, removeVendorDocument, uploadVendorDocument } from '../lib/documentUpload';

export function Vendors() {
  const { vendors, updateVendor, addVendor, deleteVendor } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | 'add'>('view');
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const pendingDoc = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentChange = (docName: string, value: string) => {
    if (!selectedVendor) return;
    setSelectedVendor({
      ...selectedVendor,
      documents: {
        ...selectedVendor.documents,
        [docName]: value
      }
    });
  };

  const handleUploadClick = (docName: string) => {
    pendingDoc.current = docName;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const docName = pendingDoc.current;
    e.target.value = '';
    if (!file || !docName || !selectedVendor) return;

    setUploadingDoc(docName);
    try {
      const path = await uploadVendorDocument(selectedVendor.id, docName, file);
      handleDocumentChange(docName, path);
    } catch (err) {
      alert(`Gagal mengunggah dokumen: ${(err as Error).message}`);
    } finally {
      setUploadingDoc(null);
      pendingDoc.current = null;
    }
  };

  const handleViewDocument = async (path: string) => {
    try {
      const url = await getVendorDocumentUrl(path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert(`Gagal membuka dokumen: ${(err as Error).message}`);
    }
  };

  const handleRemoveDocument = async (docName: string) => {
    const path = selectedVendor?.documents[docName];
    if (!path) return;
    try {
      await removeVendorDocument(path);
    } catch (err) {
      alert(`Gagal menghapus dokumen: ${(err as Error).message}`);
      return;
    }
    handleDocumentChange(docName, '');
  };

  const handleSave = () => {
    if (!selectedVendor) return;
    if (viewMode === 'add') {
      addVendor(selectedVendor);
    } else {
      updateVendor(selectedVendor);
    }
    setSelectedVendor(null);
  };

  return (
    <div className="flex flex-col gap-lg pb-xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-xs border-b border-outline-variant pb-sm">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-1">Vendor Directory</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage and evaluate your enterprise supplier ecosystem.</p>
        </div>
        <button 
          onClick={() => {
            setSelectedVendor({
              id: `V-${Math.floor(10000 + Math.random() * 90000)}`,
              name: '', category: '', subCategory: '', phone: '', email: '', salesPerson: '',
              documents: { 'NIB': '', 'Akta Pendirian': '', 'Akta Pengesahan': '', 'NPWP': '', 'PKP': '', 'Non PKP': '', 'Sertifikat': '', 'Dokumen Pendukung': '', 'Registration Form RAJA': '' },
              bankName: '', bankAccountName: '', bankAccount: '', npwpNumber: '', nibAddress: '', correspAddress: '', remarks: '',
              status: '', statusColor: '', dotColor: ''
            });
            setViewMode('add');
          }}
          className="bg-secondary text-on-secondary rounded-lg py-sm px-md flex items-center justify-center gap-xs font-label-caps text-label-caps hover:bg-secondary/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          Add New Vendor
        </button>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-sm text-surface-container-high opacity-20 group-hover:scale-110 transition-transform duration-300">
            <Store className="h-16 w-16" />
          </div>
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider mb-2">Total Vendors</span>
          <span className="font-data-lg text-data-lg text-primary mb-2 z-10">{vendors.length}</span>
          <div className="flex items-center gap-1 z-10">
            <span className="text-on-tertiary-container bg-tertiary-fixed rounded-full px-1">↑</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">+12 this month</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-sm text-surface-container-high opacity-20 group-hover:scale-110 transition-transform duration-300">
            <CheckCircle className="h-16 w-16" />
          </div>
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider mb-2">Active</span>
          <span className="font-data-lg text-data-lg text-primary mb-2 z-10">{vendors.filter(v => v.status === 'Compliant').length}</span>
          <div className="flex items-center gap-1 z-10">
            <span className="text-on-tertiary-container bg-tertiary-fixed rounded-full px-1">↑</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">87.5% health rate</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-sm text-surface-container-high opacity-20 group-hover:scale-110 transition-transform duration-300">
            <Hourglass className="h-16 w-16" />
          </div>
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider mb-2">Pending Verification</span>
          <span className="font-data-lg text-data-lg text-primary mb-2 z-10">42</span>
          <div className="flex items-center gap-1 z-10">
            <span className="text-[#B45309] bg-[#FEF3C7] rounded-full px-1">⏱</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">Action required on 15</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-sm text-surface-container-high opacity-20 group-hover:scale-110 transition-transform duration-300">
            <AlertTriangle className="h-16 w-16" />
          </div>
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider mb-2">Non-Compliant</span>
          <span className="font-data-lg text-data-lg text-error mb-2 z-10">{vendors.filter(v => v.error).length}</span>
          <div className="flex items-center gap-1 z-10">
            <span className="text-error bg-error-container rounded-full px-1">!</span>
            <span className="font-body-sm text-body-sm text-error text-xs">-3 from last week</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col shadow-sm overflow-hidden">
        <div className="p-md border-b border-outline-variant flex flex-col sm:flex-row gap-sm justify-between items-center bg-surface-bright">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
              <Search className="text-on-surface-variant h-4 w-4" />
            </div>
            <input
              type="text"
              className="block w-full pl-xl pr-sm py-xs border border-outline-variant rounded-md bg-surface text-on-surface font-body-sm text-body-sm focus:ring-1 focus:ring-secondary focus:border-secondary transition-colors outline-none h-10"
              placeholder="Filter vendors..."
            />
          </div>
          <div className="flex items-center gap-sm w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button className="flex items-center gap-1 px-sm py-xs border border-outline-variant rounded-md bg-surface hover:bg-surface-container-low text-on-surface font-body-sm text-body-sm h-10 whitespace-nowrap">
              <Filter className="h-4 w-4" /> Category
            </button>
            <button className="flex items-center gap-1 px-sm py-xs border border-outline-variant rounded-md bg-surface hover:bg-surface-container-low text-on-surface font-body-sm text-body-sm h-10 whitespace-nowrap">
              Status
            </button>
            <button className="flex items-center gap-1 px-sm py-xs text-secondary hover:bg-secondary-fixed rounded-md font-body-sm text-body-sm h-10 whitespace-nowrap transition-colors ml-auto sm:ml-0">
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-outline-variant">
                <th className="px-sm py-sm font-label-caps text-label-caps text-outline font-semibold w-1/4">Vendor Name</th>
                <th className="px-sm py-sm font-label-caps text-label-caps text-outline font-semibold">Category</th>
                <th className="px-sm py-sm font-label-caps text-label-caps text-outline font-semibold">Sub Category</th>
                <th className="px-sm py-sm font-label-caps text-label-caps text-outline font-semibold">Compliance Status</th>
                <th className="px-sm py-sm font-label-caps text-label-caps text-outline font-semibold">Sales Person</th>
                <th className="px-sm py-sm font-label-caps text-label-caps text-outline font-semibold">No. HP</th>
                <th className="px-sm py-sm font-label-caps text-label-caps text-outline font-semibold text-right w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {vendors.map((vendor) => (
                <tr key={vendor.id} className={cn("bg-surface-container-lowest hover:bg-[#F1F5F9] transition-colors group cursor-pointer", vendor.error && "border-l-4 border-l-error")}>
                  <td className={cn("px-sm py-sm", vendor.error && "pl-2")}>
                    <div className="flex items-center gap-sm">
                      <div className="h-8 w-8 rounded bg-surface-container flex items-center justify-center border border-outline-variant flex-shrink-0">
                        <Store className="h-4 w-4 text-on-surface-variant" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate max-w-[180px]">{vendor.name}</span>
                        <span className="font-data-sm text-data-sm text-on-surface-variant text-xs">{vendor.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-sm py-sm font-body-sm text-body-sm text-on-surface">{vendor.category}</td>
                  <td className="px-sm py-sm font-body-sm text-body-sm text-on-surface-variant">{vendor.subCategory}</td>
                  <td className="px-sm py-sm">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold border", vendor.color)}>
                      {vendor.error && <AlertTriangle className="h-3 w-3" />}
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-sm py-sm font-body-sm text-body-sm text-on-surface">{vendor.salesPerson}</td>
                  <td className="px-sm py-sm font-body-sm text-body-sm text-on-surface-variant">{vendor.phone}</td>
                  <td className="px-sm py-sm text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelectedVendor(vendor); setViewMode('view'); }} className="text-on-surface-variant hover:text-primary p-1.5 rounded hover:bg-surface-container-high transition-colors" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setSelectedVendor(vendor); setViewMode('edit'); }} className="text-on-surface-variant hover:text-primary p-1.5 rounded hover:bg-surface-container-high transition-colors" title="Edit Vendor">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => {
                        deleteVendor(vendor.id);
                      }} className="text-on-surface-variant hover:text-error p-1.5 rounded hover:bg-surface-container-high transition-colors" title="Delete Vendor">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-sm border-t border-outline-variant bg-[#F8FAFC] flex items-center justify-between">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Showing <span className="font-semibold text-on-surface">1</span> to <span className="font-semibold text-on-surface">{vendors.length}</span> of <span className="font-semibold text-on-surface">{vendors.length}</span> vendors</span>
          <div className="flex items-center gap-xs">
            <button className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high border border-outline-variant disabled:opacity-50" disabled>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="px-2 py-1 rounded text-sm font-semibold bg-secondary text-on-secondary">1</button>
            <button className="px-2 py-1 rounded text-sm font-medium text-on-surface-variant hover:bg-surface-container-high">2</button>
            <button className="px-2 py-1 rounded text-sm font-medium text-on-surface-variant hover:bg-surface-container-high">3</button>
            <span className="text-on-surface-variant">...</span>
            <button className="px-2 py-1 rounded text-sm font-medium text-on-surface-variant hover:bg-surface-container-high">250</button>
            <button className="p-1 rounded text-on-surface-variant hover:bg-surface-container-high border border-outline-variant">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
            <div className="p-lg border-b border-outline-variant flex justify-between items-start sticky top-0 bg-surface-container-lowest z-10">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">
                  {viewMode === 'add' ? 'Tambah Vendor Baru' : selectedVendor.name}
                </h2>
                {viewMode !== 'add' && (
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">{selectedVendor.category} • {selectedVendor.subCategory}</p>
                )}
              </div>
              <button onClick={() => setSelectedVendor(null)} className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low transition-colors">
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
                      value={selectedVendor.name} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, name: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Kategori</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.category} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, category: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Sub Kategori</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.subCategory} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, subCategory: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Sales Person</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.salesPerson} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, salesPerson: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">No. HP</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.phone} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, phone: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.email} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, email: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                </div>
              </section>

              {/* Dokumen Administrasi */}
              <section>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">2. Dokumen Administrasi</h3>
                <input type="file" accept="application/pdf" ref={fileInputRef} className="hidden" onChange={handleFileSelected} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {['NIB', 'Akta Pendirian', 'Akta Pengesahan', 'NPWP', 'PKP', 'Non PKP', 'Sertifikat', 'Dokumen Pendukung', 'Registration Form RAJA'].map((doc) => {
                    const filePath = selectedVendor.documents[doc];
                    const isUploading = uploadingDoc === doc;
                    return (
                      <div key={doc} className="flex items-center justify-between bg-surface-bright border border-outline-variant rounded-lg p-3 gap-sm">
                        <div className="min-w-0">
                          <span className="font-body-md text-on-surface font-medium block">{doc}</span>
                          {filePath ? (
                            <span className="font-body-sm text-body-sm text-on-surface-variant truncate block">{documentFileName(filePath)}</span>
                          ) : (
                            <span className="font-body-sm text-body-sm text-error block">Belum ada dokumen</span>
                          )}
                        </div>
                        <div className="flex items-center gap-sm shrink-0">
                          {filePath && (
                            <button
                              type="button"
                              onClick={() => handleViewDocument(filePath)}
                              className="px-3 py-1 border border-outline-variant rounded text-on-surface text-body-sm hover:bg-surface-container-high transition-colors"
                            >
                              Lihat
                            </button>
                          )}
                          {(viewMode === 'edit' || viewMode === 'add') && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUploadClick(doc)}
                                disabled={isUploading}
                                className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded text-on-surface text-body-sm transition-colors disabled:opacity-50"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                {isUploading ? 'Mengunggah...' : filePath ? 'Ganti' : 'Upload'}
                              </button>
                              {filePath && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveDocument(doc)}
                                  className="text-error text-body-sm hover:underline"
                                >
                                  Hapus
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                      value={selectedVendor.bankName}
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, bankName: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Nama Pemilik Rekening</label>
                    <input
                      type="text"
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container"
                      value={selectedVendor.bankAccountName}
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, bankAccountName: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container"
                      value={selectedVendor.bankAccount}
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, bankAccount: e.target.value })}
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
                    value={selectedVendor.npwpNumber} 
                    onChange={(e) => setSelectedVendor({ ...selectedVendor, npwpNumber: e.target.value })}
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
                      value={selectedVendor.nibAddress}
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, nibAddress: e.target.value })}
                      disabled={viewMode === 'view'}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Alamat Korespondensi</label>
                    <textarea 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors min-h-[80px] resize-y disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.correspAddress}
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, correspAddress: e.target.value })}
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
                    value={selectedVendor.remarks}
                    onChange={(e) => setSelectedVendor({ ...selectedVendor, remarks: e.target.value })}
                    disabled={viewMode === 'view'}
                  ></textarea>
                </div>
              </section>
            </div>
            
            <div className="p-lg border-t border-outline-variant bg-surface-container-lowest sticky bottom-0 flex justify-end gap-md z-10 rounded-b-xl">
              <button onClick={() => setSelectedVendor(null)} className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-low transition-colors font-medium">{viewMode === 'view' ? 'Tutup' : 'Batal'}</button>
              {(viewMode === 'edit' || viewMode === 'add') && (
                <button onClick={handleSave} className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  {viewMode === 'add' ? 'Tambah Vendor' : 'Simpan Perubahan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
