import { useEffect, useRef, useState } from 'react';
import { Settings, Menu, LogOut } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { ViewType } from '../types';

interface TopNavProps {
  title: string;
  onMenuClick?: () => void;
  userEmail?: string;
  onLogout?: () => void;
  onNavigate?: (view: ViewType) => void;
}

export function TopNav({ title, onMenuClick, userEmail, onLogout, onNavigate }: TopNavProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-lg h-16 w-full bg-surface-container-lowest border-b border-outline-variant flex-shrink-0">
      {/* Mobile Menu / Title */}
      <div className="flex items-center gap-sm md:hidden">
        <button 
          onClick={onMenuClick}
          className="text-on-surface-variant hover:bg-surface-container-low p-xs rounded-full transition-colors cursor-pointer active:opacity-80"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-headline-md text-headline-md text-primary">{title}</span>
      </div>

      <div className="hidden md:flex items-center gap-md">
        <h1 className="font-headline-md text-headline-md font-bold text-primary">{title}</h1>
      </div>

      {/* Trailing Actions & Profile */}
      <div className="flex items-center gap-sm ml-auto md:ml-0">
        <NotificationDropdown onNavigate={(view) => onNavigate?.(view)} />
        <button
          onClick={() => onNavigate?.('settings')}
          className="text-on-surface-variant hover:bg-surface-container-low p-xs rounded-full transition-colors cursor-pointer hidden sm:block"
        >
          <Settings className="h-5 w-5" />
        </button>
        <div className="relative ml-xs" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen((open) => !open)}
            className="h-8 w-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md text-label-md border border-outline-variant cursor-pointer hover:opacity-80 transition-opacity"
          >
            {initial}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-64 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg overflow-hidden z-40">
              <div className="px-md py-sm border-b border-outline-variant">
                <p className="font-body-sm text-body-sm text-on-surface-variant">Signed in as</p>
                <p className="font-body-md text-body-md text-on-surface truncate">{userEmail}</p>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onLogout?.();
                }}
                className="w-full flex items-center gap-sm px-md py-sm text-error hover:bg-error/10 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-body-sm text-body-sm">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
