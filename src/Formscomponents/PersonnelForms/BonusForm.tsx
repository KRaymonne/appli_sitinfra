import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  employeeNumber: string;
}

interface BonusFormData {
  userId: number;
  bonusType: string;
  amount: number;
  currency: string;
  awardDate: string;
  reason: string;
  paymentMethod: string;
  status: string;
  supportingDocument: string;
}

interface BonusFormProps {
  initialData?: any;
  isEdit?: boolean;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export function BonusForm({ initialData, isEdit = false, onSubmit, onCancel }: BonusFormProps = {}) {
  const { t } = useTranslation();
  const { userId: authUserId, effectiveCountryCode } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<BonusFormData>({
    userId: 0,
    bonusType: '',
    amount: 0,
    currency: 'XOF',
    awardDate: '',
    reason: '',
    paymentMethod: '',
    status: 'PENDING',
    supportingDocument: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.userId || initialData.user?.id || 0,
        bonusType: initialData.bonusType || '',
        amount: initialData.amount || 0,
        currency: initialData.currency || 'XOF',
        awardDate: initialData.awardDate ? initialData.awardDate.split('T')[0] : '',
        reason: initialData.reason || '',
        paymentMethod: initialData.paymentMethod || '',
        status: initialData.status || 'PENDING',
        supportingDocument: initialData.supportingDocument || ''
      });
    }
  }, [initialData]);

  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch('/.netlify/functions/personnel-users');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error('Error loading users:', err);
      }
    };
    loadUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = isEdit 
        ? `/.netlify/functions/personnel-bonuses?id=${initialData?.bonusId}` 
        : '/.netlify/functions/personnel-bonuses';
        
      const method = isEdit ? 'PUT' : 'POST';

      const mapCodeToEnum = (code: string): string => {
        switch (code) {
          case 'cameroun': return 'CAMEROON';
          case 'coteIvoire': return 'IVORY_COAST';
          case 'italie': return 'ITALIE';
          case 'ghana': return 'GHANA';
          case 'benin': return 'BENIN';
          case 'togo': return 'TOGO';
          case 'romanie': return 'ROMANIE';
          default: return 'CAMEROON';
        }
      };
      const payload = {
        ...formData,
        Inserteridentity: authUserId,
        InserterCountry: mapCodeToEnum(effectiveCountryCode)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || (isEdit ? t('personnel.forms.messages.errorUpdate') : t('personnel.forms.messages.errorCreate')) + ' de la prime');
      }

      setSuccess(`Prime ${isEdit ? t('personnel.forms.messages.successUpdate') : t('personnel.forms.messages.successCreate')}`);
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(formData);
      }

      // Return to list after successful edit
      if (isEdit && onCancel) {
        setTimeout(() => {
          onCancel();
        }, 1000);
      }
      
      // Reset form only when creating new bonus
      if (!isEdit) {
        setFormData({
          userId: 0,
          bonusType: '',
          amount: 0,
          currency: 'XOF',
          awardDate: '',
          reason: '',
          paymentMethod: '',
          status: 'PENDING',
          supportingDocument: ''
        });
      }
    } catch (err: any) {
      setError(err.message || t('personnel.forms.messages.errorUnknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{isEdit ? t('personnel.forms.titles.editBonus') : t('personnel.forms.titles.createBonus')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.employee')} <span className="text-red-500">*</span>
            </label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={0}>{t('personnel.forms.placeholders.selectEmployee')}</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.employeeNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.bonusType')} <span className="text-red-500">*</span>
            </label>
            <select
              name="bonusType"
              value={formData.bonusType}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t('personnel.forms.placeholders.selectType')}</option>
              <option value="PERFORMANCE">{t('personnel.forms.options.bonusTypes.PERFORMANCE')}</option>
              <option value="SENIORITY">{t('personnel.forms.options.bonusTypes.SENIORITY')}</option>
              <option value="SPECIAL">{t('personnel.forms.options.bonusTypes.SPECIAL')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.amount')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('personnel.forms.placeholders.amountPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.currency')} <span className="text-red-500">*</span>
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="XAF">{t('personnel.forms.options.currencies.XAF')}</option>
              <option value="XOF">{t('personnel.forms.options.currencies.XOF')}</option>
              <option value="EUR">{t('personnel.forms.options.currencies.EUR')}</option>
              <option value="GNF">{t('personnel.forms.options.currencies.GNF')}</option>
              <option value="GHS">{t('personnel.forms.options.currencies.GHS')}</option>
              <option value="RON">{t('personnel.forms.options.currencies.RON')}</option>
              <option value="SLE">{t('personnel.forms.options.currencies.SLE')}</option>
              <option value="USD">{t('personnel.forms.options.currencies.USD')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.awardDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="awardDate"
              value={formData.awardDate}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('personnel.forms.labels.reason')}
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t('personnel.forms.placeholders.describeBonusReason')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.paymentMethod')} <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t('personnel.forms.placeholders.selectMethod')}</option>
              <option value="CASH">{t('personnel.forms.options.paymentMethods.CASH')}</option>
              <option value="BANK_TRANSFER">{t('personnel.forms.options.paymentMethods.BANK_TRANSFER')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.status')} <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="PENDING">{t('personnel.forms.options.statuses.PENDING')}</option>
              <option value="APPROVED">{t('personnel.forms.options.statuses.APPROVED')}</option>
              <option value="REJECTED">{t('personnel.forms.options.statuses.REJECTED')}</option>
            </select>
          </div>
        </div>

        <FileUpload
          label={t('personnel.forms.labels.supportingDocument')}
          value={formData.supportingDocument}
          onChange={(url) => setFormData(prev => ({ ...prev, supportingDocument: url || '' }))}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          useSupabase={false}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <div className="flex justify-end space-x-2">
          {isEdit && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              {t('personnel.forms.buttons.cancel')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFormData({
                userId: 0,
                bonusType: '',
                amount: 0,
                currency: 'XOF',
                awardDate: '',
                reason: '',
                paymentMethod: '',
                status: 'PENDING',
                supportingDocument: ''
              })}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              {t('personnel.forms.buttons.reset')}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60 hover:bg-blue-700"
          >
            {loading ? t('personnel.forms.buttons.loading') : (isEdit ? t('personnel.forms.buttons.updateBonus') : t('personnel.forms.buttons.createBonus'))}
          </button>
        </div>
      </form>
    </div>
  );
}
