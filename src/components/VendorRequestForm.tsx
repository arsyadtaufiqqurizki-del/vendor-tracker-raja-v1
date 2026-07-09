import { useRef, useState, ChangeEvent } from 'react';
import { ArrowLeft, CheckCircle2, Upload } from 'lucide-react';
import { documentFileName } from '../lib/documentUpload';
import { generateVendorRequestId, submitVendorRequest, uploadRequestDocument, VendorRequestSubmission } from '../lib/vendorRequests';

interface VendorRequestFormProps {
  accessKey: string;
  onBack: () => void;
}

const DOCUMENT_TYPES = ['NIB', 'Akta Pendirian', 'Akta Pengesahan', 'NPWP', 'PKP', 'Non PKP', 'Sertifikat', 'Dokumen Pendukung', 'Registration Form RAJA'];

const emptyForm: VendorRequestSubmission = {
  name: '', category: '', subCategory: '', phone: '', email: '',
  documents: Object.fromEntries(DOCUMENT_TYPES.map(doc => [doc, ''])),
  bankName: '', bankAccountName: '', bankAccount: '', npwpNumber: '', nibAddress: '', correspAddress: '', remarks: '',
};

export function VendorRequestForm({ accessKey, onBack }: VendorRequestFormProps) {
  const [requestId] = useState(() => generateVendorRequestId());
  const [form, setForm] = useState<VendorRequestSubmission>(emptyForm);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const pendingDoc = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleDocumentChange = (docName: string, value: string) => {
    setForm(prev => ({ ...prev, documents: { ...prev.documents, [docName]: value } }));
  };

  const handleUploadClick = (docName: string) => {
    pendingDoc.current = docName;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const docName = pendingDoc.current;
    e.target.value = '';
    if (!file || !docName) return;

    setUploadingDoc(docName);
    try {
      const path = await uploadRequestDocument(requestId, docName, file);
      handleDocumentChange(docName, path);
    } catch (err) {
      alert(`Gagal mengunggah dokumen: ${(err as Error).message}`);
    } finally {
      setUploadingDoc(null);
      pendingDoc.current = null;
    }
  };

  const isValid =
    form.name.trim() !== '' &&
    form.category.trim() !== '' &&
    form.email.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.bankName.trim() !== '' &&
    form.bankAccountName.trim() !== '' &&
    form.bankAccount.trim() !== '' &&
    form.npwpNumber.trim() !== '' &&
    form.nibAddress.trim() !== '' &&
    form.correspAddress.trim() !== '';

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitVendorRequest(accessKey, requestId, form);
      setSubmitted(true);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center gap-md py-xl">
        <CheckCircle2 className="h-12 w-12 text-on-tertiary-container" />
        <h2 className="font-headline-lg text-headline-lg text-primary">Terima kasih!</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          Request pendaftaran vendor Anda sudah kami terima dan sedang direview oleh tim kami.
        </p>
        <button
          onClick={onBack}
          className="mt-md px-md py-sm border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-low transition-colors font-label-caps text-label-caps"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg w-full">
      <div className="flex items-center gap-sm">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-headline-lg text-headline-lg text-primary">Form Pendaftaran Vendor</h2>
      </div>

      {submitError && (
        <div className="px-md py-sm rounded-lg bg-error-container/50 text-on-error-container font-body-sm text-body-sm">
          {submitError}
        </div>
      )}

      <section>
        <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">1. Informasi Dasar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="md:col-span-2">
            <label className="block font-label-md text-on-surface-variant mb-1">Nama Vendor <span className="text-error">*</span></label>
            <input
              type="text"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Kategori <span className="text-error">*</span></label>
            <input
              type="text"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Sub Kategori</label>
            <input
              type="text"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
              value={form.subCategory}
              onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">No. HP <span className="text-error">*</span></label>
            <input
              type="text"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Email <span className="text-error">*</span></label>
            <input
              type="email"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">2. Dokumen Administrasi</h3>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelected} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {DOCUMENT_TYPES.map((doc) => {
            const filePath = form.documents[doc];
            const isUploading = uploadingDoc === doc;
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
                <div className="flex items-center gap-sm shrink-0">
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
                      onClick={() => handleDocumentChange(doc, '')}
                      className="text-error text-body-sm hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">3. Informasi Rekening Bank</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Nama Bank <span className="text-error">*</span></label>
            <input
              type="text"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Nama Pemilik Rekening <span className="text-error">*</span></label>
            <input
              type="text"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
              value={form.bankAccountName}
              onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Nomor Rekening <span className="text-error">*</span></label>
            <input
              type="text"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
              value={form.bankAccount}
              onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">4. Informasi Pajak</h3>
        <div>
          <label className="block font-label-md text-on-surface-variant mb-1">No. NPWP <span className="text-error">*</span></label>
          <input
            type="text"
            className="w-full md:w-1/2 bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
            value={form.npwpNumber}
            onChange={(e) => setForm({ ...form, npwpNumber: e.target.value })}
          />
        </div>
      </section>

      <section>
        <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">5. Informasi Alamat</h3>
        <div className="flex flex-col gap-md">
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Alamat Perusahaan Berdasarkan NIB <span className="text-error">*</span></label>
            <textarea
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors min-h-[80px] resize-y"
              value={form.nibAddress}
              onChange={(e) => setForm({ ...form, nibAddress: e.target.value })}
            ></textarea>
          </div>
          <div>
            <label className="block font-label-md text-on-surface-variant mb-1">Alamat Korespondensi <span className="text-error">*</span></label>
            <textarea
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors min-h-[80px] resize-y"
              value={form.correspAddress}
              onChange={(e) => setForm({ ...form, correspAddress: e.target.value })}
            ></textarea>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">6. Remarks</h3>
        <textarea
          className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors min-h-[100px] resize-y"
          placeholder="Tambahkan catatan (opsional)..."
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
        ></textarea>
      </section>

      <div className="flex justify-end gap-md pt-sm">
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
        </button>
      </div>
    </div>
  );
}
