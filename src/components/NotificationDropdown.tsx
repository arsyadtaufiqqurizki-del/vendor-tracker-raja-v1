import { useEffect, useRef, useState } from 'react';
import { Bell, ShieldAlert, Inbox } from 'lucide-react';
import { useVendors } from '../contexts/VendorContext';
import { ViewType } from '../types';
import { cn } from '../lib/utils';

interface NotificationDropdownProps {
  onNavigate: (view: ViewType) => void;
}

interface NotificationItem {
  id: string;
  icon: typeof ShieldAlert;
  title: string;
  subtitle: string;
  view: ViewType;
}

export function NotificationDropdown({ onNavigate }: NotificationDropdownProps) {
  const { vendors, vendorRequests } = useVendors();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const pendingRequests: NotificationItem[] = vendorRequests
    .filter((r) => r.requestStatus === 'pending')
    .map((r) => ({
      id: `request-${r.id}`,
      icon: Inbox,
      title: r.name,
      subtitle: 'Permintaan vendor baru menunggu persetujuan',
      view: 'requestForm',
    }));

  const nonCompliantVendors: NotificationItem[] = vendors
    .filter((v) => v.error)
    .map((v) => ({
      id: `compliance-${v.id}`,
      icon: ShieldAlert,
      title: v.name,
      subtitle: v.status,
      view: 'compliance',
    }));

  const notifications = [...pendingRequests, ...nonCompliantVendors];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="text-on-surface-variant hover:bg-surface-container-low p-xs rounded-full transition-colors cursor-pointer relative"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-[3px] rounded-full bg-error text-on-error text-[10px] font-label-caps flex items-center justify-center leading-none">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg overflow-hidden z-40">
          <div className="px-md py-sm border-b border-outline-variant">
            <p className="font-label-md text-label-md text-on-surface">Notifikasi</p>
          </div>

          {notifications.length === 0 ? (
            <div className="px-md py-lg text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">Tidak ada notifikasi baru</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto no-scrollbar">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigate(item.view);
                  }}
                  className={cn(
                    "w-full flex items-start gap-sm px-md py-sm text-left transition-colors border-b border-outline-variant last:border-b-0",
                    "hover:bg-surface-container-low"
                  )}
                >
                  <item.icon className="h-4 w-4 text-error flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-body-sm text-body-sm text-on-surface truncate">{item.title}</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{item.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
