import { Search, Bell, Settings, Menu } from 'lucide-react';

interface TopNavProps {
  title: string;
  onMenuClick?: () => void;
}

export function TopNav({ title, onMenuClick }: TopNavProps) {
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

      {/* Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-lg">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
            <Search className="text-on-surface-variant h-4 w-4" />
          </div>
          <input
            type="text"
            className="block w-full pl-xl pr-sm py-xs border border-transparent rounded-full bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:ring-1 focus:ring-secondary focus:border-secondary focus:bg-surface-container-lowest transition-colors outline-none placeholder-on-surface-variant"
            placeholder="Search across enterprise..."
          />
        </div>
      </div>

      {/* Trailing Actions & Profile */}
      <div className="flex items-center gap-sm ml-auto md:ml-0">
        <button className="text-on-surface-variant hover:bg-surface-container-low p-xs rounded-full transition-colors cursor-pointer relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error"></span>
        </button>
        <button className="text-on-surface-variant hover:bg-surface-container-low p-xs rounded-full transition-colors cursor-pointer hidden sm:block">
          <Settings className="h-5 w-5" />
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant ml-xs cursor-pointer hover:opacity-80 transition-opacity">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200"
            alt="User Profile"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
