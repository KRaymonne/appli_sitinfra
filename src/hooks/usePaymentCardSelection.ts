import { useState, useEffect } from 'react';

interface PaymentCard {
  cardId: number;
  numBadge: string;
  typeBadge: string;
  description?: string;
  montant: number;
}

export const usePaymentCardSelection = () => {
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPaymentCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/vehicle-paymentcards?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des cartes de paiement');
      }
      const data = await res.json();
      setPaymentCards(data.paymentCards || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentCards();
  }, []);

  const getPaymentCardOptions = () => {
    return paymentCards.map((card) => ({
      value: card.cardId,
      label: `${card.numBadge} - ${card.typeBadge}${card.description ? ` (${card.description})` : ''}`,
      card,
    }));
  };

  const getPaymentCardById = (cardId: number) => {
    return paymentCards.find(card => card.cardId === cardId);
  };

  return {
    paymentCards,
    loading,
    error,
    getPaymentCardOptions,
    getPaymentCardById,
    refetch: loadPaymentCards,
  };
};
