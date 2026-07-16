import { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, FileWarning, Eye, Edit2, Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVendors } from '../contexts/VendorContext';
import { Vendor } from '../types';
import { VendorModal } from '../components/VendorModal';

export function Compliance() {
  const { vendors, updateVendor } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Compliant' | 'Non-Compliant'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  const compliantVendorsCount = vendors.filter(v => !v.error).length;
  const nonCompliantVendorsCount = vendors.filter(v => v.error).length;
  const missingPkpCount = vendors.filter(v => v.error && v.status.includes('PKP')).length;

  const handleSaveVendor = (updatedVendor: Vendor) => {
    updateVendor(updatedVendor);
    setSelectedVendor(null);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'Compliant') return matchesSearch && !vendor.error;
    if (filterStatus === 'Non-Compliant') return matchesSearch && vendor.error;
    return matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / ROWS_PER_PAGE));
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  return (
    <div className="flex flex-col gap-lg pb-xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-lg border-b border-outline-variant pb-sm">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-1">Document Compliance</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Manage and track vendor administrative completeness.</p>
        </div>
        <div className="flex gap-sm">
          <button className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm px-md py-xs rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-xs">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Compliant Vendors</h3>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex items-end justify-between">
            <div className="font-data-lg text-data-lg text-primary">{compliantVendorsCount}</div>
            <div className="font-data-sm text-data-sm text-on-surface-variant">
              {((compliantVendorsCount / vendors.length) * 100).toFixed(0)}% of total
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Non-Compliant</h3>
            <ShieldAlert className="h-5 w-5 text-error" />
          </div>
          <div className="flex items-end justify-between">
            <div className="font-data-lg text-data-lg text-primary">{nonCompliantVendorsCount}</div>
            <div className="flex items-center gap-1 text-on-error-container bg-error-container/50 px-2 py-1 rounded-full font-data-sm text-[12px]">
              Requires Action
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Missing PKP/Non-PKP</h3>
            <FileWarning className="h-5 w-5 text-orange-500" />
          </div>
          <div className="flex items-end justify-between">
            <div className="font-data-lg text-data-lg text-primary">{missingPkpCount}</div>
            <div className="font-data-sm text-data-sm text-on-surface-variant">Common issue</div>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col mt-md">
        <div className="p-lg border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-bright">
          <h3 className="font-headline-md text-headline-md text-primary">Compliance Records</h3>
          <div className="flex gap-sm w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant h-4 w-4" />
              <input 
                type="text" 
                className="w-full bg-surface border border-outline-variant rounded-lg py-1.5 pl-xl pr-md font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors" 
                placeholder="Search records..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="bg-surface border border-outline-variant rounded-lg py-1.5 px-3 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="All">All Status</option>
              <option value="Compliant">Compliant</option>
              <option value="Non-Compliant">Non-Compliant</option>
            </select>
            <button className="p-1.5 text-on-surface-variant hover:bg-surface-container-low border border-outline-variant rounded transition-colors flex-shrink-0 flex items-center justify-center">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant font-label-caps text-label-caps text-on-surface-variant uppercase">
                <th className="p-md font-semibold">VENDOR NAME</th>
                <th className="p-md font-semibold">CATEGORY</th>
                <th className="p-md font-semibold">NIB</th>
                <th className="p-md font-semibold">AKTA</th>
                <th className="p-md font-semibold">NPWP</th>
                <th className="p-md font-semibold">PKP / NON</th>
                <th className="p-md font-semibold">STATUS</th>
                <th className="p-md font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container-highest">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-md text-center text-on-surface-variant">No vendors found.</td>
                </tr>
              ) : (
                paginatedVendors.map((vendor, index) => (
                  <tr key={index} className="hover:bg-surface-container-low transition-colors group">
                    <td className="p-md text-primary">{vendor.name}</td>
                    <td className="p-md">{vendor.category}</td>
                    <td className="p-md">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${vendor.documents['NIB'] ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {vendor.documents['NIB'] ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="p-md">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${vendor.documents['Akta Pendirian'] && vendor.documents['Akta Pengesahan'] ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {vendor.documents['Akta Pendirian'] && vendor.documents['Akta Pengesahan'] ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="p-md">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${vendor.documents['NPWP'] ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {vendor.documents['NPWP'] ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="p-md">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${vendor.documents['PKP'] || vendor.documents['Non PKP'] ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {vendor.documents['PKP'] || vendor.documents['Non PKP'] ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="p-md">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${vendor.statusColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${vendor.dotColor}`}></span> {vendor.status}
                      </span>
                    </td>
                    <td className="p-md text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedVendor(vendor); setViewMode('view'); }} className="text-on-surface-variant hover:text-primary p-1.5 rounded hover:bg-surface-container-high transition-colors" title="View Details">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setSelectedVendor(vendor); setViewMode('edit'); }} className="text-on-surface-variant hover:text-primary p-1.5 rounded hover:bg-surface-container-high transition-colors" title="Edit Vendor">
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-md border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-md bg-surface-bright text-on-surface-variant font-body-sm text-body-sm">
          <span>
            {filteredVendors.length === 0
              ? 'Showing 0 entries'
              : `Showing ${(currentPage - 1) * ROWS_PER_PAGE + 1}-${Math.min(currentPage * ROWS_PER_PAGE, filteredVendors.length)} of ${filteredVendors.length} entries`}
          </span>
          <div className="flex items-center gap-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-body-sm text-body-sm text-on-surface">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedVendor && (
        <VendorModal 
          vendor={selectedVendor}
          viewMode={viewMode}
          onClose={() => setSelectedVendor(null)}
          onSave={handleSaveVendor}
        />
      )}
    </div>
  );
}
