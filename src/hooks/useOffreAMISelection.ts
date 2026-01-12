import { useState, useEffect } from 'react';

interface OffreAMI {
  amiId: number;
  activityCode?: string;
  depositDate: string;
  name: string;
  client: string;
  contact?: string;
  submissionDate: string;
  object: string;
  status: string;
  comment?: string;
  soumissionType?: string;
  attachment?: string;
}

export const useOffreAMISelection = () => {
  const [offreAMI, setOffreAMI] = useState<OffreAMI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffreAMI = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/offre-ami?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des AMI');
      }
      const data = await res.json();
      setOffreAMI(data.offreAMI || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffreAMI();
  }, []);

  const getOffreAMIOptions = () => {
    return offreAMI.map((ami) => ({
      value: ami.amiId,
      label: `${ami.name} - ${ami.object.substring(0, 50)}...`,
      ami,
    }));
  };

  const getOffreAMIById = (amiId: number) => {
    return offreAMI.find(ami => ami.amiId === amiId);
  };

  const getOffreAMIByStatus = (status: string) => {
    return offreAMI.filter(ami => ami.status === status);
  };

  return {
    offreAMI,
    loading,
    error,
    getOffreAMIOptions,
    getOffreAMIById,
    getOffreAMIByStatus,
    refetch: loadOffreAMI,
  };
};