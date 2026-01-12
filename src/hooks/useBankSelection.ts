import { useState, useEffect } from 'react';

interface Bank {
  bankId: number;
  name: string;
  type: string;
  balance: number;
  devise: string;
  attachment?: string;
}

export const useBankSelection = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBanks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/Banks-banks?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des comptes bancaires');
      }
      const data = await res.json();
      setBanks(data.banks || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, []);

  const getBankOptions = () => {
    return banks.map((bank) => ({
      value: bank.bankId,
      label: `${bank.name} - ${bank.devise}`,
      bank,
    }));
  };

  const getBankById = (bankId: number) => {
    return banks.find(bank => bank.bankId === bankId);
  };

  return {
    banks,
    loading,
    error,
    getBankOptions,
    getBankById,
    refetch: loadBanks,
  };
};

