import React from 'react';
import { X } from 'lucide-react';

interface Bank {
  bankId: number;
  name: string;
  type: string;
  balance: number;
  devise: string;
  attachment?: string;
  createdAt: string;
  updatedAt: string;
}

interface BankViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: Bank | null;
}

const BankViewModal: React.FC<BankViewModalProps> = ({ isOpen, onClose, bank }) => {
  if (!isOpen || !bank) return null;

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CHECKING_ACCOUNT': return 'Compte courant';
      case 'SAVINGS_ACCOUNT': return 'Compte épargne';
      case 'PROJECT_ACCOUNT': return 'Compte projet';
      default: return type;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Détails du compte bancaire</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du compte
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {bank.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de compte
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {getTypeText(bank.type)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solde
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md font-semibold">
                {formatCurrency(bank.balance, bank.devise)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Devise
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {bank.devise}
              </p>
            </div>
          </div>

          {/* Pièce jointe */}
          {bank.attachment && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pièce jointe
              </label>
              <div className="bg-gray-50 p-3 rounded-md">
                <a
                  href={bank.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Voir
                </a>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de création
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {formatDate(bank.createdAt)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dernière modification
              </label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {formatDate(bank.updatedAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankViewModal;
