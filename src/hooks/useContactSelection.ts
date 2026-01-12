import { useState, useEffect } from 'react';

interface Contact {
  contactId: number;
  contactGroupe: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
}

export const useContactSelection = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/Contact-contacts?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des contacts');
      }
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const getContactOptions = () => {
    return contacts.map((contact) => ({
      value: contact.contactId,
      label: `${contact.firstName} ${contact.lastName} - ${contact.companyName}`,
      contact,
    }));
  };

  const getContactById = (contactId: number) => {
    return contacts.find(contact => contact.contactId === contactId);
  };

  const getContactsByGroupe = (groupe: string) => {
    return contacts.filter(contact => contact.contactGroupe === groupe);
  };

  const getContactsByCompany = (company: string) => {
    return contacts.filter(contact => contact.companyName === company);
  };

  return {
    contacts,
    loading,
    error,
    getContactOptions,
    getContactById,
    getContactsByGroupe,
    getContactsByCompany,
    refetch: loadContacts,
  };
};

