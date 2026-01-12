import { useState, useEffect } from 'react';

interface OffreDAO {
  daoId: number;
  activityCode?: string;
  transmissionDate: string;
  daoNumber: string;
  clientname: string; // Changé selon le modèle Prisma
  contactname?: string; // Changé selon le modèle Prisma
  submissionDate?: string;
  submissionType: string;
  object: string;
  status: string;
  attachment?: string;
  devise?: string; // Changé de currency à devise
}

export const useOffreDAOSelection = () => {
  const [offreDAO, setOffreDAO] = useState<OffreDAO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffreDAO = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/offre-dao?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des DAO');
      }
      const data = await res.json();
      setOffreDAO(data.offreDAO || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffreDAO();
  }, []);

  const getOffreDAOOptions = () => {
    return offreDAO.map((dao) => ({
      value: dao.daoId,
      label: `${dao.daoNumber} - ${dao.clientname}`,
      dao,
    }));
  };

  const getOffreDAOById = (daoId: number) => {
    return offreDAO.find(dao => dao.daoId === daoId);
  };

  const getOffreDAOByStatus = (status: string) => {
    return offreDAO.filter(dao => dao.status === status);
  };

  const getOffreDAOBySubmissionType = (submissionType: string) => {
    return offreDAO.filter(dao => dao.submissionType === submissionType);
  };

  return {
    offreDAO,
    loading,
    error,
    getOffreDAOOptions,
    getOffreDAOById,
    getOffreDAOByStatus,
    getOffreDAOBySubmissionType,
    refetch: loadOffreDAO,
  };
};

