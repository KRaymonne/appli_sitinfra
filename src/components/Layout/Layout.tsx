import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export function Layout() {
  const { effectiveCountryCode, setEffectiveCountryCode } = useAuth();

  const handleCountryChange = (newCountry: string) => {
    setEffectiveCountryCode(newCountry);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar country={effectiveCountryCode} />
      <div className="flex-1 flex flex-col">
        <Header onCountryChange={handleCountryChange} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}