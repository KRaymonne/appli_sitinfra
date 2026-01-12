import { useState, useEffect } from 'react';

interface CompanyExpense {
  companyExpenseId: number;
  chargeType: string;
  userId?: number;
  amount: number;
  currency: string;
  paymentDate: string;
  description?: string;
  status: string;
  employee?: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

export const useCompanyExpenseSelection = () => {
  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanyExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/Invoice-companyexpenses?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des charges entreprise');
      }
      const data = await res.json();
      setCompanyExpenses(data.companyExpenses || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyExpenses();
  }, []);

  return {
    companyExpenses,
    loading,
    error,
    refetch: loadCompanyExpenses,
  };
};

