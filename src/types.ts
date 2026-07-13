export type ViewType = 'dashboard' | 'vendors' | 'prospectiveVendors' | 'compliance' | 'requestForm';

export interface Vendor {
  id: string;
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
  status: string;
  statusColor: string;
  dotColor: string;
  icon?: string;
  color?: string;
  error?: boolean;
  createdAt: string;
}

export type ProspectiveStatus = 'New' | 'In Discussion' | 'Converted';

export interface ProspectiveVendor {
  id: string;
  name: string;
  contactEmail: string;
  contactPerson?: string;
  whatsapp?: string;
  category: string;
  status: ProspectiveStatus;
}

export type VendorRequestStatus = 'pending' | 'approved' | 'rejected';

export interface VendorRequest {
  id: string;
  requestStatus: VendorRequestStatus;
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
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AccessKey {
  code: string;
  active: boolean;
  createdAt: string;
  expiresAt: string;
}
