import { LucideIcon, LayoutDashboard, Factory, Users, ShieldCheck, Inbox, Plus, HelpCircle, LogOut } from 'lucide-react';
import { ViewType } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onNewRequisition?: () => void;
  onLogout?: () => void;
}

const navItems: { id: ViewType; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vendors', label: 'Vendors', icon: Factory },
  { id: 'prospectiveVendors', label: 'Prospective Vendors', icon: Users },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'requestForm', label: 'Request Form', icon: Inbox },
];

export function Sidebar({ currentView, onViewChange, isOpen, onClose, onNewRequisition, onLogout }: SidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <nav className={cn(
        "fixed left-0 top-0 h-screen w-[280px] flex-col p-md gap-xs bg-surface-container-lowest border-r border-outline-variant z-50 transition-transform duration-300 ease-in-out md:translate-x-0 md:flex flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      {/* Header */}
      <div className="flex items-center gap-sm mb-lg px-xs py-sm">
        <div className="h-10 w-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
          <Factory className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline-md text-headline-md text-primary truncate leading-tight">Procurement RAJA</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant truncate uppercase tracking-wider">Enterprise Mgt</span>
        </div>
      </div>

      {/* CTA Button */}
      <button 
        onClick={onNewRequisition}
        className="w-full bg-secondary text-on-secondary rounded-lg py-sm px-md flex items-center justify-center gap-xs font-label-caps text-label-caps mb-md hover:bg-secondary/90 transition-colors shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Add New Vendor
      </button>

      {/* Main Navigation Links */}
      <div className="flex flex-col gap-xs flex-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "flex items-center gap-sm px-md py-sm rounded-lg transition-all group duration-200 w-full text-left",
                isActive 
                  ? "bg-secondary-fixed text-on-secondary-fixed font-semibold" 
                  : "text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              <item.icon className={cn("h-5 w-5", !isActive && "group-hover:translate-x-1 duration-200")} />
              <span className="font-body-md text-body-md">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="mt-auto flex flex-col gap-xs pt-md border-t border-outline-variant">
        <button className="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all group duration-200 w-full text-left">
          <HelpCircle className="h-5 w-5 group-hover:translate-x-1 duration-200" />
          <span className="font-body-md text-body-md">Support</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center gap-sm px-md py-sm rounded-lg text-error hover:bg-error/10 transition-all group duration-200 w-full text-left"
        >
          <LogOut className="h-5 w-5 group-hover:translate-x-1 duration-200" />
          <span className="font-body-md text-body-md">Sign Out</span>
        </button>
      </div>
    </nav>
    </>
  );
}
