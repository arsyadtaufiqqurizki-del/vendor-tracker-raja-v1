import { supabase } from './supabase';
import { AccessKey } from '../types';

const accessKeyFromRow = (row: any): AccessKey => ({
  code: row.code,
  active: row.active,
  createdAt: row.created_at,
});

export async function listAccessKeys(): Promise<AccessKey[]> {
  const { data, error } = await supabase
    .from('vendor_access_keys')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(accessKeyFromRow);
}

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function generateAccessKey(): Promise<AccessKey> {
  const code = randomCode();
  const { data, error } = await supabase.from('vendor_access_keys').insert({ code }).select().single();
  if (!error) return accessKeyFromRow(data);

  // Primary key collision on the 6-digit code — retry once with a fresh code.
  if (error.code === '23505') {
    const retryCode = randomCode();
    const { data: retryData, error: retryError } = await supabase
      .from('vendor_access_keys')
      .insert({ code: retryCode })
      .select()
      .single();
    if (retryError) throw retryError;
    return accessKeyFromRow(retryData);
  }

  throw error;
}

export async function setAccessKeyActive(code: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('vendor_access_keys').update({ active }).eq('code', code);
  if (error) throw error;
}

export async function deleteAccessKey(code: string): Promise<void> {
  const { error } = await supabase.from('vendor_access_keys').delete().eq('code', code);
  if (error) throw error;
}
