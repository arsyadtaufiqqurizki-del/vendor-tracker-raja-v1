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

// list()/select() both default to a 1000-row page; a bare call silently
// truncates once a folder or the vendor_requests table grows past that, so
// every listing here pages through to the end instead of trusting one call.
const PAGE_SIZE = 1000;

async function listAllEntries(prefix: string) {
  const entries: { name: string; id: string | null }[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage.from(REQUEST_BUCKET).list(prefix, { limit: PAGE_SIZE, offset });
    if (error) throw error;
    entries.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return entries;
}

async function fetchKnownRequestIds(): Promise<Set<string>> {
  const ids: string[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase
      .from('vendor_requests')
      .select('id')
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    ids.push(...(data ?? []).map((r) => r.id as string));
    if (!data || data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return new Set(ids);
}

// Storage "folders" are just path prefixes: an entry with id === null is a
// pseudo-folder (Supabase synthesizes it from other objects' paths), so it
// needs a recursive list() to reach the actual files inside it.
async function listFilesUnderPrefix(prefix: string): Promise<string[]> {
  const entries = await listAllEntries(prefix);
  const paths: string[] = [];
  for (const entry of entries) {
    const entryPath = `${prefix}/${entry.name}`;
    if (entry.id === null) {
      paths.push(...(await listFilesUnderPrefix(entryPath)));
    } else {
      paths.push(entryPath);
    }
  }
  return paths;
}

// Files land in this bucket as soon as a vendor uploads a document, before
// they submit the request (see TODO_CLEANUP_ORPHANED_REQUEST_DOCUMENTS.MD).
// A top-level folder is orphaned when its name (the request id) doesn't
// match any row in vendor_requests — regardless of that row's status, since
// approved/rejected requests still legitimately reference their folder.
export async function listOrphanedRequestDocuments(): Promise<string[]> {
  const topLevel = await listAllEntries('');
  const knownIds = await fetchKnownRequestIds();

  const orphanedFolders = topLevel.filter((entry) => entry.id === null && !knownIds.has(entry.name));

  const paths: string[] = [];
  for (const folder of orphanedFolders) {
    paths.push(...(await listFilesUnderPrefix(folder.name)));
  }
  return paths;
}

export async function deleteRequestDocuments(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  // Re-check right before deleting: a vendor may have submitted the request
  // for one of these folders in the gap between the scan and this confirm
  // click, in which case it's no longer orphaned and must be kept.
  const knownIds = await fetchKnownRequestIds();
  const safePaths = paths.filter((p) => !knownIds.has(p.split('/')[0]));
  if (safePaths.length === 0) return;
  const { error } = await supabase.storage.from(REQUEST_BUCKET).remove(safePaths);
  if (error) throw error;
}
