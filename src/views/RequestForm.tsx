import { useEffect, useState } from 'react';
import { AlertTriangle, Ban, Check, Eraser, Eye, KeyRound, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useVendors } from '../contexts/VendorContext';
import { AccessKey, VendorRequest, VendorRequestStatus } from '../types';
import { VendorRequestDetailModal } from '../components/VendorRequestDetailModal';
import { listAccessKeys, generateAccessKey, setAccessKeyActive, deleteAccessKey } from '../lib/accessKeys';
import { listOrphanedRequestDocuments, deleteRequestDocuments } from '../lib/vendorRequests';

type RequestFilter = 'Semua' | 'Pending' | 'Rejected' | 'Approved';
type Tab = 'permintaan' | 'accessKey';

const statusFilterMatch: Record<RequestFilter, (status: VendorRequestStatus) => boolean> = {
  Semua: () => true,
  Pending: (s) => s === 'pending',
  Rejected: (s) => s === 'rejected',
  Approved: (s) => s === 'approved',
};

function StatusBadge({ status }: { status: VendorRequestStatus }) {
  if (status === 'pending') {
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium text-[#B45309] bg-[#FEF3C7]">Pending</span>;
  }
  if (status === 'approved') {
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium text-on-tertiary-container bg-tertiary-fixed/20">Approved</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium text-on-error-container bg-error-container/50">Rejected</span>;
}

export function RequestForm() {
  const { vendorRequests, approveVendorRequest, rejectVendorRequest, deleteVendorRequest } = useVendors();
  const [tab, setTab] = useState<Tab>('permintaan');
  const [filter, setFilter] = useState<RequestFilter>('Pending');
  const [selectedRequest, setSelectedRequest] = useState<VendorRequest | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [requestToDelete, setRequestToDelete] = useState<VendorRequest | null>(null);
  const [deletingRequest, setDeletingRequest] = useState(false);

  const [accessKeys, setAccessKeys] = useState<AccessKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newlyGeneratedCode, setNewlyGeneratedCode] = useState<string | null>(null);

  const [orphanedPaths, setOrphanedPaths] = useState<string[] | null>(null);
  const [scanningOrphans, setScanningOrphans] = useState(false);
  const [deletingOrphans, setDeletingOrphans] = useState(false);

  const refreshAccessKeys = async () => {
    setLoadingKeys(true);
    try {
      setAccessKeys(await listAccessKeys());
    } catch (err) {
      alert(`Gagal memuat access key: ${(err as Error).message}`);
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (tab === 'accessKey') refreshAccessKeys();
  }, [tab]);

  const filteredRequests = vendorRequests.filter((r) => statusFilterMatch[filter](r.requestStatus));

  const handleAccept = async (request: VendorRequest) => {
    if (!confirm(`Terima request "${request.name}"? Data akan dipindahkan ke menu Vendors.`)) return;
    setProcessingId(request.id);
    try {
      await approveVendorRequest(request);
    } catch (err) {
      alert(`Gagal menerima request: ${(err as Error).message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: VendorRequest) => {
    if (!confirm(`Tolak request "${request.name}"? Request akan diarsipkan.`)) return;
    setProcessingId(request.id);
    try {
      await rejectVendorRequest(request.id);
    } catch (err) {
      alert(`Gagal menolak request: ${(err as Error).message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    setDeletingRequest(true);
    try {
      await deleteVendorRequest(requestToDelete);
      setRequestToDelete(null);
    } catch (err) {
      alert(`Gagal menghapus request: ${(err as Error).message}`);
    } finally {
      setDeletingRequest(false);
    }
  };

  const handleGenerateKey = async () => {
    setGeneratingKey(true);
    setNewlyGeneratedCode(null);
    try {
      const key = await generateAccessKey();
      setNewlyGeneratedCode(key.code);
      await refreshAccessKeys();
    } catch (err) {
      alert(`Gagal membuat kode baru: ${(err as Error).message}`);
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleToggleActive = async (key: AccessKey) => {
    try {
      await setAccessKeyActive(key.code, !key.active);
      setAccessKeys(accessKeys.map((k) => (k.code === key.code ? { ...k, active: !k.active } : k)));
    } catch (err) {
      alert(`Gagal mengubah status kode: ${(err as Error).message}`);
    }
  };

  const handleDeleteKey = async (key: AccessKey) => {
    if (!confirm(`Hapus kode ${key.code}? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await deleteAccessKey(key.code);
      setAccessKeys(accessKeys.filter((k) => k.code !== key.code));
    } catch (err) {
      alert(`Gagal menghapus kode: ${(err as Error).message}`);
    }
  };

  const handleScanOrphans = async () => {
    setScanningOrphans(true);
    try {
      setOrphanedPaths(await listOrphanedRequestDocuments());
    } catch (err) {
      alert(`Gagal memindai file: ${(err as Error).message}`);
    } finally {
      setScanningOrphans(false);
    }
  };

  const handleConfirmDeleteOrphans = async () => {
    if (!orphanedPaths || orphanedPaths.length === 0) return;
    setDeletingOrphans(true);
    try {
      await deleteRequestDocuments(orphanedPaths);
      setOrphanedPaths(null);
    } catch (err) {
      alert(`Gagal menghapus file: ${(err as Error).message}`);
    } finally {
      setDeletingOrphans(false);
    }
  };

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-xs border-b border-outline-variant pb-sm">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-1">Request Form</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Review pendaftaran vendor mandiri dan kelola access key.</p>
        </div>
      </div>

      <div className="flex gap-xs border-b border-outline-variant">
        <button
          onClick={() => setTab('permintaan')}
          className={cn(
            "px-md py-sm font-label-caps text-label-caps border-b-2 transition-colors -mb-px",
            tab === 'permintaan' ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"
          )}
        >
          Permintaan
        </button>
        <button
          onClick={() => setTab('accessKey')}
          className={cn(
            "px-md py-sm font-label-caps text-label-caps border-b-2 transition-colors -mb-px",
            tab === 'accessKey' ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"
          )}
        >
          Access Key
        </button>
      </div>

      {tab === 'permintaan' && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-lg border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-bright">
            <h3 className="font-headline-md text-headline-md text-primary">Daftar Permintaan</h3>
            <div className="flex items-center gap-sm">
              <button
                onClick={handleScanOrphans}
                disabled={scanningOrphans}
                title="Cari file dokumen yang sudah terupload tapi request-nya tidak pernah disubmit"
                className="border border-outline-variant text-on-surface-variant rounded-lg py-1.5 px-3 flex items-center gap-xs font-label-caps text-label-caps hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                <Eraser className="h-4 w-4" />
                {scanningOrphans ? 'Memindai...' : 'Bersihkan File Belum Submit'}
              </button>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as RequestFilter)}
                className="bg-surface border border-outline-variant rounded-lg py-1.5 px-3 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
              >
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
                <option value="Approved">Approved</option>
                <option value="Semua">Semua</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-bright border-b border-outline-variant font-label-caps text-label-caps text-on-surface-variant uppercase">
                  <th className="p-md font-semibold">NAMA VENDOR</th>
                  <th className="p-md font-semibold">KATEGORI</th>
                  <th className="p-md font-semibold">EMAIL</th>
                  <th className="p-md font-semibold">DIAJUKAN</th>
                  <th className="p-md font-semibold">STATUS</th>
                  <th className="p-md font-semibold text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container-highest">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-md text-center text-on-surface-variant">Tidak ada request.</td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="p-md text-primary">{r.name}</td>
                      <td className="p-md">{r.category}</td>
                      <td className="p-md text-on-surface-variant">{r.email}</td>
                      <td className="p-md text-on-surface-variant">{new Date(r.submittedAt).toLocaleString('id-ID')}</td>
                      <td className="p-md"><StatusBadge status={r.requestStatus} /></td>
                      <td className="p-md text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedRequest(r)}
                            className="text-on-surface-variant hover:text-primary p-1.5 rounded hover:bg-surface-container-high transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {(r.requestStatus === 'pending' || r.requestStatus === 'rejected') && (
                            <button
                              onClick={() => handleAccept(r)}
                              disabled={processingId === r.id}
                              className="text-on-tertiary-container hover:bg-tertiary-fixed/20 p-1.5 rounded transition-colors disabled:opacity-50"
                              title="Accept"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          {r.requestStatus === 'pending' && (
                            <button
                              onClick={() => handleReject(r)}
                              disabled={processingId === r.id}
                              className="text-error hover:bg-error-container/50 p-1.5 rounded transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          {(r.requestStatus === 'approved' || r.requestStatus === 'rejected') && (
                            <button
                              onClick={() => setRequestToDelete(r)}
                              className="text-error hover:bg-error-container/50 p-1.5 rounded transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-md border-t border-outline-variant bg-surface-bright text-on-surface-variant font-body-sm text-body-sm">
            Showing {filteredRequests.length} of {vendorRequests.length} requests
          </div>
        </div>
      )}

      {tab === 'accessKey' && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-lg border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-bright">
            <h3 className="font-headline-md text-headline-md text-primary">Kelola Access Key</h3>
            <button
              onClick={handleGenerateKey}
              disabled={generatingKey}
              className="bg-secondary text-on-secondary rounded-lg py-sm px-md flex items-center justify-center gap-xs font-label-caps text-label-caps hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-70"
            >
              <Plus className="h-4 w-4" />
              {generatingKey ? 'Membuat...' : 'Generate Kode Baru'}
            </button>
          </div>

          {newlyGeneratedCode && (
            <div className="m-lg p-md rounded-lg bg-tertiary-fixed/20 text-on-tertiary-container font-body-sm text-body-sm flex items-center gap-sm">
              <KeyRound className="h-4 w-4 flex-shrink-0" />
              Kode baru dibuat: <span className="font-data-lg text-data-lg tracking-widest">{newlyGeneratedCode}</span> — bagikan ke vendor untuk mengakses tab "Vendor Login".
            </div>
          )}

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-bright border-b border-outline-variant font-label-caps text-label-caps text-on-surface-variant uppercase">
                  <th className="p-md font-semibold">KODE</th>
                  <th className="p-md font-semibold">DIBUAT</th>
                  <th className="p-md font-semibold">STATUS</th>
                  <th className="p-md font-semibold text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container-highest">
                {loadingKeys ? (
                  <tr>
                    <td colSpan={4} className="p-md text-center text-on-surface-variant">Memuat...</td>
                  </tr>
                ) : accessKeys.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-md text-center text-on-surface-variant">Belum ada access key.</td>
                  </tr>
                ) : (
                  accessKeys.map((k) => (
                    <tr key={k.code} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-md text-primary font-data-lg text-data-lg tracking-widest">{k.code}</td>
                      <td className="p-md text-on-surface-variant">{new Date(k.createdAt).toLocaleString('id-ID')}</td>
                      <td className="p-md">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium",
                          k.active ? "text-on-tertiary-container bg-tertiary-fixed/20" : "text-on-surface-variant bg-surface-container-high"
                        )}>
                          {k.active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-md text-right">
                        <div className="flex items-center justify-end gap-sm">
                          <button
                            onClick={() => handleToggleActive(k)}
                            className={cn("relative inline-flex h-6 w-11 items-center rounded-full transition-colors", k.active ? "bg-secondary" : "bg-surface-container-highest")}
                            title={k.active ? 'Nonaktifkan kode' : 'Aktifkan kode'}
                          >
                            <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", k.active ? "translate-x-6" : "translate-x-1")} />
                          </button>
                          <button
                            onClick={() => handleDeleteKey(k)}
                            className="text-error hover:bg-error-container/50 p-1.5 rounded transition-colors"
                            title="Hapus kode"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedRequest && (
        <VendorRequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      )}

      {requestToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-md"
          onClick={() => !deletingRequest && setRequestToDelete(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-xl border border-outline-variant max-w-[420px] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-lg border-b border-outline-variant flex items-start gap-sm">
              <div className="h-9 w-9 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-error" />
              </div>
              <div>
                <h3 className="font-headline-md text-headline-md text-primary">Hapus Request</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Anda yakin ingin menghapus request <span className="font-semibold text-on-surface">{requestToDelete.name}</span>? Dokumen yang terupload untuk request ini juga akan dihapus dari storage. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="p-lg flex justify-end gap-sm">
              <button
                onClick={() => setRequestToDelete(null)}
                disabled={deletingRequest}
                className="border border-outline-variant text-on-surface-variant rounded-lg py-sm px-md font-label-caps text-label-caps hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deletingRequest}
                className="bg-error text-on-error rounded-lg py-sm px-md font-label-caps text-label-caps hover:bg-error/90 transition-colors disabled:opacity-50"
              >
                {deletingRequest ? 'Menghapus...' : 'Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {orphanedPaths !== null && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-md"
          onClick={() => !deletingOrphans && setOrphanedPaths(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-xl border border-outline-variant max-w-2xl w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-lg border-b border-outline-variant">
              <h3 className="font-headline-md text-headline-md text-primary">File Belum Submit</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {orphanedPaths.length === 0
                  ? 'Tidak ada file yang perlu dibersihkan — semua file di bucket sudah terkait request yang tersimpan.'
                  : `Ditemukan ${orphanedPaths.length} file yang terupload tapi request-nya tidak pernah disubmit. File berikut akan dihapus permanen dari storage:`}
              </p>
            </div>
            {orphanedPaths.length > 0 && (
              <div className="overflow-y-auto p-lg flex-1">
                <ul className="font-body-sm text-body-sm text-on-surface-variant space-y-1 list-disc list-inside break-all">
                  {orphanedPaths.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="p-lg border-t border-outline-variant flex justify-end gap-sm">
              <button
                onClick={() => setOrphanedPaths(null)}
                disabled={deletingOrphans}
                className="border border-outline-variant text-on-surface-variant rounded-lg py-sm px-md font-label-caps text-label-caps hover:bg-surface-container-high transition-colors disabled:opacity-50"
              >
                {orphanedPaths.length === 0 ? 'Tutup' : 'Batal'}
              </button>
              {orphanedPaths.length > 0 && (
                <button
                  onClick={handleConfirmDeleteOrphans}
                  disabled={deletingOrphans}
                  className="bg-error text-on-error rounded-lg py-sm px-md font-label-caps text-label-caps hover:bg-error/90 transition-colors disabled:opacity-50"
                >
                  {deletingOrphans ? 'Menghapus...' : `Hapus ${orphanedPaths.length} File`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
