import { ReactNode } from 'react';
import { SimpleHeader } from './SimpleHeader';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { effectiveCountryCode, role } = useAuth();
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'DIRECTEUR_TECHNIQUE' || role === 'DIRECTEUR_ADMINISTRATIF';
  if (isAdmin) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar country={effectiveCountryCode} />
        <div className="flex-1 flex flex-col">
          <SimpleHeader />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SimpleHeader />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

