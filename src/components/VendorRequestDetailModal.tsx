import { X } from 'lucide-react';
import { VendorRequest } from '../types';
import { documentFileName } from '../lib/documentUpload';
import { getRequestDocumentUrl } from '../lib/vendorRequests';

interface VendorRequestDetailModalProps {
  request: VendorRequest;
  onClose: () => void;
}

const DOCUMENT_TYPES = ['NIB', 'Akta Pendirian', 'Akta Pengesahan', 'NPWP', 'PKP', 'Non PKP', 'Sertifikat', 'Dokumen Pendukung', 'Registration Form RAJA'];

const fieldClass = "w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface opacity-70 disabled:bg-surface-container";

export function VendorRequestDetailModal({ request, onClose }: VendorRequestDetailModalProps) {
  const handleViewDocument = async (path: string) => {
    try {
      const url = await getRequestDocumentUrl(path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      alert(`Gagal membuka dokumen: ${(err as Error).message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
        <div className="p-lg border-b border-outline-variant flex justify-between items-start sticky top-0 bg-surface-container-lowest z-10">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-primary">{request.name || '(Tanpa Nama)'}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">{request.category} • {request.subCategory}</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-lg flex flex-col gap-xl">
          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">1. Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="md:col-span-2">
                <label className="block font-label-md text-on-surface-variant mb-1">Nama Vendor</label>
                <input type="text" className={fieldClass} value={request.name} disabled />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Kategori</label>
                <input type="text" className={fieldClass} value={request.category} disabled />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Sub Kategori</label>
                <input type="text" className={fieldClass} value={request.subCategory || '-'} disabled />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">No. HP</label>
                <input type="text" className={fieldClass} value={request.phone} disabled />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Email</label>
                <input type="email" className={fieldClass} value={request.email} disabled />
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">2. Dokumen Administrasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {DOCUMENT_TYPES.map((doc) => {
                const filePath = request.documents[doc];
                return (
                  <div key={doc} className="flex items-center justify-between bg-surface-bright border border-outline-variant rounded-lg p-3 gap-sm">
                    <div className="min-w-0">
                      <span className="font-body-md text-on-surface font-medium block">{doc}</span>
                      {filePath ? (
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate block">{documentFileName(filePath)}</span>
                      ) : (
                        <span className="font-body-sm text-body-sm text-on-surface-variant block">Belum ada dokumen</span>
                      )}
                    </div>
                    {filePath && (
                      <button
                        type="button"
                        onClick={() => handleViewDocument(filePath)}
                        className="shrink-0 px-3 py-1 border border-outline-variant rounded text-on-surface text-body-sm hover:bg-surface-container-high transition-colors"
                      >
                        Lihat
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">3. Informasi Rekening Bank</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Nama Bank</label>
                <input type="text" className={fieldClass} value={request.bankName} disabled />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Nama Pemilik Rekening</label>
                <input type="text" className={fieldClass} value={request.bankAccountName} disabled />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Nomor Rekening</label>
                <input type="text" className={fieldClass} value={request.bankAccount} disabled />
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">4. Informasi Pajak</h3>
            <div>
              <label className="block font-label-md text-on-surface-variant mb-1">No. NPWP</label>
              <input type="text" className={`w-full md:w-1/2 ${fieldClass}`} value={request.npwpNumber} disabled />
            </div>
          </section>

          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">5. Informasi Alamat</h3>
            <div className="flex flex-col gap-md">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Alamat Perusahaan Berdasarkan NIB</label>
                <textarea className={`${fieldClass} min-h-[80px] resize-y`} value={request.nibAddress} disabled></textarea>
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">Alamat Korespondensi</label>
                <textarea className={`${fieldClass} min-h-[80px] resize-y`} value={request.correspAddress} disabled></textarea>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">6. Remarks</h3>
            <textarea className={`${fieldClass} min-h-[100px] resize-y`} value={request.remarks || '-'} disabled></textarea>
          </section>
        </div>

        <div className="p-lg border-t border-outline-variant bg-surface-container-lowest sticky bottom-0 flex justify-end gap-md z-10 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-low transition-colors font-medium">Tutup</button>
        </div>
      </div>
    </div>
  );
}
