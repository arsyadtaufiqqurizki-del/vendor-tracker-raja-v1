export type ViewType = 'dashboard' | 'vendors' | 'prospectiveVendors' | 'compliance';

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
