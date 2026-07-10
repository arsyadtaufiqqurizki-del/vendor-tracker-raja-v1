import { supabase } from './supabase';
import { sanitize, BUCKET as VENDOR_DOCUMENTS_BUCKET } from './documentUpload';
import { Vendor, VendorRequest } from '../types';

const REQUEST_BUCKET = 'vendor-request-documents';

export async function checkAccessKey(code: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_vendor_access_key', { p_code: code });
  if (error) throw error;
  return data === true;
}

export interface VendorRequestSubmission {
  name: string;
  category: string;
  subCategory: string;
  phone: string;
  email: string;
  salesPerson: string;
  documents: Record<string, string>;
  bankName: string;
  bankAccountName: string;
  bankAccount: string;
  npwpNumber: string;
  nibAddress: string;
  correspAddress: string;
  remarks: string;
}

// Generated up front by the form (before any document upload happens), so
// uploaded files and the final submitted row share the same request id.
export function generateVendorRequestId(): string {
  return `VR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function submitVendorRequest(accessKey: string, id: string, data: VendorRequestSubmission): Promise<void> {
  const { error } = await supabase.rpc('submit_vendor_request', {
    p_access_key: accessKey,
    p_id: id,
    p_name: data.name,
    p_category: data.category,
    p_sub_category: data.subCategory,
    p_phone: data.phone,
    p_email: data.email,
    p_sales_person: data.salesPerson,
    p_documents: data.documents,
    p_bank_name: data.bankName,
    p_bank_account_name: data.bankAccountName,
    p_bank_account: data.bankAccount,
    p_npwp_number: data.npwpNumber,
    p_nib_address: data.nibAddress,
    p_corresp_address: data.correspAddress,
    p_remarks: data.remarks,
  });
  if (error) throw error;
}

// No upsert: the path already embeds Date.now(), so it never collides, and
// upsert:true would require anon SELECT/UPDATE storage policies too (Postgres
// checks ON CONFLICT DO UPDATE's RLS even when no row actually conflicts) —
// which would let any vendor read or overwrite another vendor's documents in
// this private, pre-review bucket.
export async function uploadRequestDocument(requestId: string, docName: string, file: File): Promise<string> {
  const path = `${sanitize(requestId)}/${sanitize(docName)}/${Date.now()}-${sanitize(file.name)}`;
  const { error } = await supabase.storage.from(REQUEST_BUCKET).upload(path, file);
  if (error) throw error;
  return path;
}

// Staff-only: preview a document still sitting in the request-only bucket
// (before the request is approved and its files are moved to vendor-documents).
export async function getRequestDocumentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(REQUEST_BUCKET).createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

const requestFromRow = (row: any): VendorRequest => ({
  id: row.id,
  requestStatus: row.status,
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
  submittedAt: row.submitted_at,
  reviewedAt: row.reviewed_at ?? undefined,
  reviewedBy: row.reviewed_by ?? undefined,
});

export async function listVendorRequests(): Promise<VendorRequest[]> {
  const { data, error } = await supabase
    .from('vendor_requests')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(requestFromRow);
}

// Moves each uploaded document from the request-only bucket into the
// authenticated vendor-documents bucket, so an approved vendor's files live
// in the same place as documents uploaded via the normal Vendor modal.
async function moveRequestDocumentsToVendorBucket(
  vendorId: string,
  documents: Record<string, string>
): Promise<Record<string, string>> {
  const moved: Record<string, string> = {};
  for (const [docName, path] of Object.entries(documents)) {
    if (!path) {
      moved[docName] = '';
      continue;
    }
    const { data: blob, error: downloadError } = await supabase.storage.from(REQUEST_BUCKET).download(path);
    if (downloadError) throw downloadError;
    const fileName = path.split('/').pop() ?? path;
    const newPath = `${sanitize(vendorId)}/${sanitize(docName)}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from(VENDOR_DOCUMENTS_BUCKET).upload(newPath, blob, { upsert: true });
    if (uploadError) throw uploadError;
    moved[docName] = newPath;
  }
  return moved;
}

export async function approveVendorRequest(request: VendorRequest): Promise<Vendor> {
  const vendorId = `V-${Math.floor(10000 + Math.random() * 90000)}`;
  const documents = await moveRequestDocumentsToVendorBucket(vendorId, request.documents);

  const { error: insertError } = await supabase.from('vendors').insert({
    id: vendorId,
    name: request.name,
    category: request.category,
    sub_category: request.subCategory,
    phone: request.phone,
    email: request.email,
    sales_person: request.salesPerson,
    documents,
    bank_name: request.bankName,
    bank_account_name: request.bankAccountName,
    bank_account: request.bankAccount,
    npwp_number: request.npwpNumber,
    nib_address: request.nibAddress,
    corresp_address: request.correspAddress,
    remarks: request.remarks,
  });
  if (insertError) throw insertError;

  const { data: userData } = await supabase.auth.getUser();
  const { error: updateError } = await supabase
    .from('vendor_requests')
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: userData.user?.email ?? null })
    .eq('id', request.id);
  if (updateError) throw updateError;

  return {
    id: vendorId,
    name: request.name,
    category: request.category,
    subCategory: request.subCategory,
    phone: request.phone,
    email: request.email,
    salesPerson: request.salesPerson,
    documents,
    bankName: request.bankName,
    bankAccountName: request.bankAccountName,
    bankAccount: request.bankAccount,
    npwpNumber: request.npwpNumber,
    nibAddress: request.nibAddress,
    correspAddress: request.correspAddress,
    remarks: request.remarks,
    status: '',
    statusColor: '',
    dotColor: '',
    createdAt: new Date().toISOString(),
  };
}

export async function rejectVendorRequest(id: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('vendor_requests')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: userData.user?.email ?? null })
    .eq('id', id);
  if (error) throw error;
}
