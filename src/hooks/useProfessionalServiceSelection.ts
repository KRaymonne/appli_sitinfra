import { useState, useEffect } from 'react';

interface ProfessionalService {
  professionalServiceId: number;
  invoiceNumber: string;
  serviceType: string;
  supplier: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  paymentDate?: string;
  status: string;
}

export const useProfessionalServiceSelection = () => {
  const [professionalServices, setProfessionalServices] = useState<ProfessionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfessionalServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/Invoice-professionalservices?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des services professionnels');
      }
      const data = await res.json();
      setProfessionalServices(data.professionalServices || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfessionalServices();
  }, []);

  return {
    professionalServices,
    loading,
    error,
    refetch: loadProfessionalServices,
  };
};

