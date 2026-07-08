import { useState } from 'react';
import { UserPlus, Mail, MessageCircle, Clock, CheckCircle2, Trash2, Edit2 } from 'lucide-react';
import { useVendors } from '../contexts/VendorContext';
import { ProspectiveVendorModal } from '../components/ProspectiveVendorModal';
import { ProspectiveVendor } from '../types';

export function ProspectiveVendors() {
  const { prospectiveVendors, addProspectiveVendor, updateProspectiveVendor, deleteProspectiveVendor } = useVendors();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<ProspectiveVendor | null>(null);

  const totalProspects = prospectiveVendors.length;
  const inContact = prospectiveVendors.filter(v => v.status === 'In Discussion').length;
  const converted = prospectiveVendors.filter(v => v.status === 'Converted').length;

  return (
    <div className="flex flex-col gap-lg pb-xl">
      {/* Header */}
      <div className="mb-xs flex items-end justify-between">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-xs">Prospective Vendors</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage and contact potential vendors for future partnerships.</p>
        </div>
        <div className="flex gap-sm">
          <button 
            onClick={() => {
              setEditingVendor(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-md py-sm border border-outline-variant rounded-lg bg-surface hover:bg-surface-container-low transition-colors text-primary font-label-caps text-label-caps shadow-sm"
          >
            <UserPlus className="mr-xs h-4 w-4" />
            Add Prospect
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
        <div className="bg-surface border border-outline-variant rounded-xl p-lg relative overflow-hidden group hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant">Total Prospects</h3>
            <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
              <UserPlus className="h-4 w-4" />
            </div>
          </div>
          <div className="font-data-lg text-data-lg text-primary mb-xs">{totalProspects}</div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-fixed-dim opacity-50"></div>
        </div>
        
        <div className="bg-surface border border-outline-variant rounded-xl p-lg relative overflow-hidden group hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant">In Contact</h3>
            <div className="h-8 w-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="font-data-lg text-data-lg text-primary mb-xs">{inContact}</div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary opacity-50"></div>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-lg relative overflow-hidden group hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant">Converted</h3>
            <div className="h-8 w-8 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="font-data-lg text-data-lg text-primary mb-xs">{converted}</div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-tertiary opacity-50"></div>
        </div>
      </div>
      
      {/* List / Table Area */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-md border-b border-outline-variant">
          <h3 className="font-headline-sm text-headline-sm text-primary">Recent Prospects</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant">
                <th className="p-md font-label-caps text-label-caps text-on-surface-variant font-medium">Vendor Name</th>
                <th className="p-md font-label-caps text-label-caps text-on-surface-variant font-medium">Category</th>
                <th className="p-md font-label-caps text-label-caps text-on-surface-variant font-medium">Status</th>
                <th className="p-md font-label-caps text-label-caps text-on-surface-variant font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prospectiveVendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                  <td className="p-md">
                    <div className="font-body-md text-primary font-medium">{vendor.name}</div>
                    <div className="font-body-sm text-on-surface-variant">Email: {vendor.contactEmail}</div>
                    {vendor.contactPerson && <div className="font-body-sm text-on-surface-variant">Person: {vendor.contactPerson}</div>}
                  </td>
                  <td className="p-md">
                    <span className="px-sm py-1 bg-surface-container-high rounded text-body-sm text-on-surface">{vendor.category}</span>
                  </td>
                  <td className="p-md">
                    <span className={`flex items-center gap-xs text-body-sm font-medium ${
                      vendor.status === 'In Discussion' ? 'text-secondary' : 
                      vendor.status === 'Converted' ? 'text-tertiary' : 'text-on-surface-variant'
                    }`}>
                      {vendor.status === 'In Discussion' && <Clock className="w-3 h-3" />}
                      {vendor.status === 'Converted' && <CheckCircle2 className="w-3 h-3" />}
                      {vendor.status === 'New' && <UserPlus className="w-3 h-3" />}
                      {vendor.status}
                    </span>
                  </td>
                  <td className="p-md">
                    <div className="flex justify-end gap-sm">
                      <a href={`mailto:${vendor.contactEmail}`} className="p-sm rounded hover:bg-surface-container-high text-on-surface-variant transition-colors" title="Send Email">
                        <Mail className="w-4 h-4" />
                      </a>
                      {vendor.whatsapp && (
                        <a href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-sm rounded hover:bg-surface-container-high text-on-surface-variant transition-colors" title="WhatsApp">
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      <button 
                        onClick={() => {
                          setEditingVendor(vendor);
                          setIsModalOpen(true);
                        }}
                        className="p-sm rounded hover:bg-surface-container-high text-on-surface-variant transition-colors" 
                        title="Edit Prospect"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          deleteProspectiveVendor(vendor.id);
                        }} 
                        className="p-sm rounded hover:bg-error-container text-on-surface-variant hover:text-on-error-container transition-colors" 
                        title="Delete Prospect"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProspectiveVendorModal 
          onClose={() => {
            setIsModalOpen(false);
            setEditingVendor(null);
          }} 
          onSave={(vendorData) => {
            if (editingVendor) {
              updateProspectiveVendor(vendorData);
            } else {
              addProspectiveVendor(vendorData);
            }
            setIsModalOpen(false);
            setEditingVendor(null);
          }}
          vendorToEdit={editingVendor}
        />
      )}
    </div>
  );
}
