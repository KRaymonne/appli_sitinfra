import { useState, useEffect } from 'react';

interface OtherInvoice {
  otherInvoiceId: number;
  invoiceNumber: string;
  category?: string;
  description?: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  paymentDate?: string;
  supplier: string;
  supplierContactId?: number;
  status: string;
  supplierContact?: {
    contactId: number;
    firstName: string;
    lastName: string;
    companyName: string;
  };
}

export const useOtherInvoiceSelection = () => {
  const [otherInvoices, setOtherInvoices] = useState<OtherInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOtherInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/Invoice-otherinvoices?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des autres factures');
      }
      const data = await res.json();
      setOtherInvoices(data.otherInvoices || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOtherInvoices();
  }, []);

  return {
    otherInvoices,
    loading,
    error,
    refetch: loadOtherInvoices,
  };
};

