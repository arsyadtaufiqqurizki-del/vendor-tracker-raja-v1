import { supabase } from './supabase';

export const BUCKET = 'vendor-documents';

export function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

export async function uploadVendorDocument(vendorId: string, docName: string, file: File): Promise<string> {
  const path = `${sanitize(vendorId)}/${sanitize(docName)}/${Date.now()}-${sanitize(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function getVendorDocumentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeVendorDocument(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export function documentFileName(path: string): string {
  const base = path.split('/').pop() ?? path;
  return base.replace(/^\d+-/, '');
}
