import { ArrowRight, KeyRound, LogOut, Mail } from 'lucide-react';
import { ViewType } from '../types';

interface SettingsProps {
  userEmail?: string;
  onLogout?: () => void;
  onNavigate: (view: ViewType) => void;
}

export function Settings({ userEmail, onLogout, onNavigate }: SettingsProps) {
  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md mb-xs border-b border-outline-variant pb-sm">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary mb-1">Settings</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Preferensi akun dan konfigurasi aplikasi.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-lg border-b border-outline-variant bg-surface-bright">
          <h3 className="font-headline-md text-headline-md text-primary">Akun</h3>
        </div>
        <div className="p-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md">
          <div className="flex items-center gap-sm">
            <div className="h-9 w-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant">Signed in as</p>
              <p className="font-body-md text-body-md text-on-surface">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-xs border border-outline-variant text-error rounded-lg py-sm px-md font-label-caps text-label-caps hover:bg-error/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-lg border-b border-outline-variant bg-surface-bright">
          <h3 className="font-headline-md text-headline-md text-primary">Akses Vendor</h3>
        </div>
        <div className="p-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md">
          <div className="flex items-center gap-sm">
            <div className="h-9 w-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <p className="font-body-md text-body-md text-on-surface">Access key vendor dikelola di halaman Request Form.</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Generate, aktifkan/nonaktifkan, atau hapus kode akses vendor di sana.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('requestForm')}
            className="flex items-center justify-center gap-xs bg-secondary text-on-secondary rounded-lg py-sm px-md font-label-caps text-label-caps hover:bg-secondary/90 transition-colors shadow-sm"
          >
            Buka Request Form
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
