import { useState, useEffect } from 'react';

interface OffreDevis {
  devisId: number;
  indexNumber: string;
  clientname: string; // Changé selon le modèle Prisma
  amount: number;
  validityDate: string;
  status: string;
  description?: string;
  attachment?: string;
  devise?: string; // Changé de currency à devise
}

export const useOffreDevisSelection = () => {
  const [offreDevis, setOffreDevis] = useState<OffreDevis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffreDevis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/offre-devis?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des devis');
      }
      const data = await res.json();
      setOffreDevis(data.offreDevis || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffreDevis();
  }, []);

  const getOffreDevisOptions = () => {
    return offreDevis.map((devis) => ({
      value: devis.devisId,
      label: `${devis.indexNumber} - ${new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: devis.devise || 'XAF',
        minimumFractionDigits: 0,
      }).format(devis.amount)}`,
      devis,
    }));
  };

  const getOffreDevisById = (devisId: number) => {
    return offreDevis.find(devis => devis.devisId === devisId);
  };

  const getOffreDevisByStatus = (status: string) => {
    return offreDevis.filter(devis => devis.status === status);
  };

  return {
    offreDevis,
    loading,
    error,
    getOffreDevisOptions,
    getOffreDevisById,
    getOffreDevisByStatus,
    refetch: loadOffreDevis,
  };
};

