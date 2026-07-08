import { useState } from 'react';
import { Download, Users, CheckCircle, Boxes, MoreHorizontal, Search, Filter, X, Upload, Eye, Edit2, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { useVendors } from '../contexts/VendorContext';
import { Vendor } from '../types';

export function Dashboard() {
  const { vendors, updateVendor, calculateCompliance } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDocumentChange = (docName: string, value: string) => {
    if (!selectedVendor) return;
    setSelectedVendor({
      ...selectedVendor,
      documents: {
        ...selectedVendor.documents,
        [docName]: value
      }
    });
  };

  const handleSave = () => {
    if (!selectedVendor) return;
    updateVendor(selectedVendor);
    setSelectedVendor(null);
  };

  // Dynamic calculations
  const totalVendors = vendors.length;

  const npwpCompliantCount = vendors.filter(v => v.documents['NPWP'] === 'Yes').length;
  const npwpComplianceRate = totalVendors > 0 ? Math.round((npwpCompliantCount / totalVendors) * 100) : 0;

  const categoryCounts = vendors.reduce((acc, vendor) => {
    acc[vendor.category] = (acc[vendor.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  let topCategory = 'N/A';
  let topCategoryCount = 0;
  Object.entries(categoryCounts).forEach(([category, count]) => {
    if (count > topCategoryCount) {
      topCategoryCount = count;
      topCategory = category;
    }
  });

  const colors = ['#2170e4', '#00a472', '#8590a6', '#545f73', '#9b51e0', '#f2994a'];
  const pieData = Object.entries(categoryCounts).map(([name, count], index) => ({
    name,
    value: totalVendors > 0 ? Math.round((count / totalVendors) * 100) : 0,
    count,
    color: colors[index % colors.length]
  })).sort((a, b) => b.value - a.value);

  const countCompliance = (docName: string) => vendors.filter(v => v.documents[docName] === 'Yes').length;
  
  const npwpRate = totalVendors > 0 ? Math.round((countCompliance('NPWP') / totalVendors) * 100) : 0;
  const aktaRate = totalVendors > 0 ? Math.round((countCompliance('Akta Pendirian') / totalVendors) * 100) : 0;
  const nibRate = totalVendors > 0 ? Math.round((countCompliance('NIB') / totalVendors) * 100) : 0;
  const pkpRate = totalVendors > 0 ? Math.round((countCompliance('PKP') / totalVendors) * 100) : 0;

  const barData = [
    { label: 'NPWP', val: npwpRate, color: 'bg-secondary-container', hover: 'hover:bg-secondary' },
    { label: 'Akta', val: aktaRate, color: 'bg-secondary-container opacity-80', hover: 'hover:bg-secondary' },
    { label: 'NIB', val: nibRate, color: 'bg-secondary-container opacity-90', hover: 'hover:bg-secondary' },
    { label: 'PKP', val: pkpRate, color: 'bg-error-container', hover: 'hover:bg-error', text: 'text-error' },
  ];

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-lg pb-xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-lg border-b border-outline-variant pb-sm">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-1">Vendor Overview Dashboard</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Last updated: Today, 09:41 AM</p>
        </div>
        <div className="flex gap-sm">
          <button className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-sm text-body-sm px-md py-xs rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-xs">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Vendors</h3>
            <Users className="h-5 w-5 text-outline-variant" />
          </div>
          <div className="flex items-end justify-between">
            <div className="font-data-lg text-data-lg text-primary">{totalVendors.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-on-tertiary-container bg-tertiary-fixed/20 px-2 py-1 rounded-full font-data-sm text-[12px]">
              Active
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] transition-shadow relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-sm">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Vendor Readiness</h3>
              <CheckCircle className="h-5 w-5 text-outline-variant" />
            </div>
            <div className="flex items-end justify-between">
              <div className="font-data-lg text-data-lg text-primary">{npwpComplianceRate}%</div>
              <div className="flex items-center gap-1 text-on-tertiary-container font-data-sm text-[12px]">
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
                NPWP Compliance
              </div>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-sm">
              <div className="bg-secondary-container h-1.5 rounded-full" style={{ width: `${npwpComplianceRate}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Top Category</h3>
            <Boxes className="h-5 w-5 text-outline-variant" />
          </div>
          <div className="flex items-end justify-between">
            <div className="font-body-md text-headline-md text-primary">{topCategory}</div>
            <div className="font-data-sm text-data-sm text-on-surface-variant">{topCategoryCount} vendors</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col">
          <h3 className="font-headline-md text-headline-md text-primary mb-md">Vendor Distribution by Category</h3>
          <div className="flex-1 flex items-center justify-center min-h-[300px] relative">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-data-lg text-data-lg text-primary">{totalVendors}</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant">Total</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-sm mt-md font-body-sm text-body-sm">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span> 
                {item.name} ({item.value}%)
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md text-primary">Administrative Compliance</h3>
            <button className="text-on-surface-variant hover:text-primary">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 flex items-end justify-between min-h-[300px] gap-2 pt-xl pb-md px-sm border-b border-outline-variant/50">
            {barData.map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-2 w-1/4 group cursor-pointer h-full justify-end">
                <div className={`font-data-sm text-data-sm opacity-0 group-hover:opacity-100 transition-opacity ${bar.text || 'text-on-surface-variant'}`}>{bar.val}%</div>
                <div className={`w-full ${bar.color} rounded-t-sm ${bar.hover} transition-colors`} style={{ height: `${bar.val}%` }}></div>
                <div className="font-label-caps text-label-caps text-on-surface-variant mt-2 text-center">{bar.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col mt-md">
        <div className="p-lg border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md bg-surface-bright">
          <h3 className="font-headline-md text-headline-md text-primary">Filtered Vendor Records</h3>
          <div className="flex gap-sm w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant h-4 w-4" />
              <input 
                type="text" 
                className="w-full bg-surface border border-outline-variant rounded-lg py-1.5 pl-xl pr-md font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors" 
                placeholder="Search records..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-1.5 text-on-surface-variant hover:bg-surface-container-low border border-outline-variant rounded transition-colors flex-shrink-0 flex items-center justify-center">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant font-label-caps text-label-caps text-on-surface-variant uppercase">
                <th className="p-md font-semibold w-12 text-center">
                  <input type="checkbox" className="rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer h-4 w-4" />
                </th>
                <th className="p-md font-semibold">NAMA VENDOR</th>
                <th className="p-md font-semibold">CATEGORY</th>
                <th className="p-md font-semibold">SUB-CATEGORY</th>
                <th className="p-md font-semibold">NO. HP</th>
                <th className="p-md font-semibold">SALES PERSON</th>
                <th className="p-md font-semibold">COMPLIANCE STATUS</th>
                <th className="p-md font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container-highest">
              {filteredVendors.map((vendor, index) => (
                <tr key={index} className="hover:bg-surface-container-low transition-colors group">
                  <td className="p-md text-center">
                    <input type="checkbox" className="rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer h-4 w-4" />
                  </td>
                  <td className="p-md text-primary">{vendor.name}</td>
                  <td className="p-md">{vendor.category}</td>
                  <td className="p-md text-on-surface-variant">{vendor.subCategory}</td>
                  <td className="p-md text-on-surface-variant">{vendor.phone}</td>
                  <td className="p-md text-on-surface-variant">{vendor.salesPerson}</td>
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
                      <button className="text-on-surface-variant hover:text-error p-1.5 rounded hover:bg-surface-container-high transition-colors" title="Delete Vendor">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-md border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-md bg-surface-bright text-on-surface-variant font-body-sm text-body-sm">
          <span>Showing {filteredVendors.length} of {totalVendors} entries</span>
          <div className="flex gap-1 items-center">
            <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container-low disabled:opacity-50 transition-colors" disabled>Prev</button>
            <button className="px-3 py-1 border border-outline-variant rounded bg-secondary-container text-on-secondary-container font-semibold transition-colors">1</button>
            <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container-low transition-colors">2</button>
            <button className="px-3 py-1 border border-outline-variant rounded bg-surface-container-lowest hover:bg-surface-container-low transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
            <div className="p-lg border-b border-outline-variant flex justify-between items-start sticky top-0 bg-surface-container-lowest z-10">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">{selectedVendor.name}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">{selectedVendor.category} • {selectedVendor.subCategory}</p>
              </div>
              <button onClick={() => setSelectedVendor(null)} className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-lg flex flex-col gap-xl">
              {/* Informasi Dasar */}
              <section>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">1. Informasi Dasar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="md:col-span-2">
                    <label className="block font-label-md text-on-surface-variant mb-1">Nama Vendor</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.name} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, name: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Kategori</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.category} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, category: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Sub Kategori</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.subCategory} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, subCategory: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Sales Person</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.salesPerson} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, salesPerson: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">No. HP</label>
                    <input 
                      type="text" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.phone} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, phone: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.email} 
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, email: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                </div>
              </section>

              {/* Dokumen Administrasi */}
              <section>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">2. Dokumen Administrasi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {['NIB', 'Akta Pendirian', 'Akta Pengesahan', 'NPWP', 'PKP', 'Non PKP', 'Sertifikat', 'Dokumen Pendukung', 'Registration Form RAJA'].map((doc) => (
                    <div key={doc} className="flex items-center justify-between bg-surface-bright border border-outline-variant rounded-lg p-3">
                      <span className="font-body-md text-on-surface font-medium">{doc}</span>
                      <div className="flex items-center gap-sm">
                        <select 
                          className="bg-surface border border-outline-variant rounded px-2 py-1 font-body-sm text-on-surface outline-none focus:border-secondary disabled:opacity-70 disabled:bg-surface-container"
                          value={selectedVendor.documents[doc]}
                          onChange={(e) => handleDocumentChange(doc, e.target.value)}
                          disabled={viewMode === 'view'}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                        {viewMode === 'edit' && (
                          <button className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded text-on-surface text-body-sm transition-colors">
                            <Upload className="h-3.5 w-3.5" />
                            Upload
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Rekening Bank */}
              <section>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">3. Informasi Rekening Bank</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Nama Bank</label>
                    <input
                      type="text"
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container"
                      value={selectedVendor.bankName}
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, bankName: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Nama Pemilik Rekening</label>
                    <input
                      type="text"
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container"
                      value={selectedVendor.bankAccountName}
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, bankAccountName: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container"
                      value={selectedVendor.bankAccount}
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, bankAccount: e.target.value })}
                      disabled={viewMode === 'view'}
                    />
                  </div>
                </div>
              </section>

              {/* NPWP */}
              <section>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">4. Informasi Pajak</h3>
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1">No. NPWP</label>
                  <input 
                    type="text" 
                    className="w-full md:w-1/2 bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors disabled:opacity-70 disabled:bg-surface-container" 
                    value={selectedVendor.npwpNumber} 
                    onChange={(e) => setSelectedVendor({ ...selectedVendor, npwpNumber: e.target.value })}
                    disabled={viewMode === 'view'}
                  />
                </div>
              </section>

              {/* Alamat */}
              <section>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">5. Informasi Alamat</h3>
                <div className="flex flex-col gap-md">
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Alamat Perusahaan Berdasarkan NIB</label>
                    <textarea 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors min-h-[80px] resize-y disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.nibAddress}
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, nibAddress: e.target.value })}
                      disabled={viewMode === 'view'}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block font-label-md text-on-surface-variant mb-1">Alamat Korespondensi</label>
                    <textarea 
                      className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors min-h-[80px] resize-y disabled:opacity-70 disabled:bg-surface-container" 
                      value={selectedVendor.correspAddress}
                      onChange={(e) => setSelectedVendor({ ...selectedVendor, correspAddress: e.target.value })}
                      disabled={viewMode === 'view'}
                    ></textarea>
                  </div>
                </div>
              </section>

              {/* Remarks */}
              <section>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md pb-2 border-b border-outline-variant/50">6. Remarks</h3>
                <div>
                  <textarea 
                    className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-colors min-h-[100px] resize-y disabled:opacity-70 disabled:bg-surface-container" 
                    placeholder="Tambahkan catatan untuk vendor ini..."
                    value={selectedVendor.remarks}
                    onChange={(e) => setSelectedVendor({ ...selectedVendor, remarks: e.target.value })}
                    disabled={viewMode === 'view'}
                  ></textarea>
                </div>
              </section>
            </div>
            
            <div className="p-lg border-t border-outline-variant bg-surface-container-lowest sticky bottom-0 flex justify-end gap-md z-10 rounded-b-xl">
              <button onClick={() => setSelectedVendor(null)} className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg hover:bg-surface-container-low transition-colors font-medium">{viewMode === 'view' ? 'Tutup' : 'Batal'}</button>
              {viewMode === 'edit' && (
                <button onClick={handleSave} className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors font-medium">Simpan Perubahan</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
