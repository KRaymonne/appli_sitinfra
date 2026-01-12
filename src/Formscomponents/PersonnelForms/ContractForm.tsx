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

interface ContractFormData {
  userId: number;
  contractType: string;
  startDate: string;
  endDate: string;
  post: string;
  department: string;
  unit: string;
  grossSalary: number;
  netSalary: number;
  currency: string;
  contractFile: string;
}

interface ContractFormProps {
  initialData?: any;
  isEdit?: boolean;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export function ContractForm({ initialData, isEdit = false, onSubmit, onCancel }: ContractFormProps = {}) {
  const { t } = useTranslation();
  const { userId: authUserId, effectiveCountryCode } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<ContractFormData>({
    userId: 0,
    contractType: '',
    startDate: '',
    endDate: '',
    post: '',
    department: '',
    unit: '',
    grossSalary: 0,
    netSalary: 0,
    currency: 'XOF',
    contractFile: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.userId || initialData.user?.id || 0,
        contractType: initialData.contractType || '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        post: initialData.post || '',
        department: initialData.department || '',
        unit: initialData.unit || '',
        grossSalary: initialData.grossSalary || 0,
        netSalary: initialData.netSalary || 0,
        currency: initialData.currency || 'XOF',
        contractFile: initialData.contractFile || ''
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
      [name]: name === 'grossSalary' || name === 'netSalary' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
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

      const contractId = initialData?.contractId;
      const url = contractId 
        ? `/.netlify/functions/personnel-contracts?id=${contractId}`
        : '/.netlify/functions/personnel-contracts';
      const method = contractId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || (isEdit ? t('personnel.forms.messages.errorEdit') : t('personnel.forms.messages.errorCreate')) + ' du contrat');
      }

      setSuccess(`Contrat ${isEdit ? t('personnel.forms.messages.successEdit') : t('personnel.forms.messages.successCreate')}`);
      
      if (onSubmit) {
        await onSubmit(formData);
      }

      // Return to list after successful edit
      if (isEdit && onCancel) {
        setTimeout(() => {
          onCancel();
        }, 1000);
      }

      if (!isEdit) {
        setFormData({
          userId: 0,
          contractType: '',
          startDate: '',
          endDate: '',
          post: '',
          department: '',
          unit: '',
          grossSalary: 0,
          netSalary: 0,
          currency: 'XOF',
          contractFile: ''
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
      <h2 className="text-xl font-semibold mb-4">{isEdit ? t('personnel.forms.titles.editContract') : t('personnel.forms.titles.createContract')}</h2>
      
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
              {t('personnel.forms.labels.contractType')} <span className="text-red-500">*</span>
            </label>
            <select
              name="contractType"
              value={formData.contractType}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t('personnel.forms.placeholders.selectType')}</option>
              <option value="PERMANENT_CONTRACT_CDI">{t('personnel.forms.options.contractTypes.PERMANENT_CONTRACT_CDI')}</option>
              <option value="FIXED_TERM_CONTRACT_CDD">{t('personnel.forms.options.contractTypes.FIXED_TERM_CONTRACT_CDD')}</option>
              <option value="INTERNSHIP">{t('personnel.forms.options.contractTypes.INTERNSHIP')}</option>
              <option value="CONSULTANT">{t('personnel.forms.options.contractTypes.CONSULTANT')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.startDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.endDate')}
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.post')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="post"
              value={formData.post}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('personnel.forms.placeholders.examplePost')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.department')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('personnel.forms.placeholders.exampleDepartment')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.unit')}
            </label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('personnel.forms.placeholders.exampleUnit')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.grossSalary')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="grossSalary"
              value={formData.grossSalary}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('personnel.forms.placeholders.amountPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.netSalary')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="netSalary"
              value={formData.netSalary}
              onChange={handleInputChange}
              required
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
        </div>

        <FileUpload
          label={t('personnel.forms.labels.contractFile')}
          value={formData.contractFile}
          onChange={(url) => setFormData(prev => ({ ...prev, contractFile: url || '' }))}
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
                contractType: '',
                startDate: '',
                endDate: '',
                post: '',
                department: '',
                unit: '',
                grossSalary: 0,
                netSalary: 0,
                currency: 'XOF',
                contractFile: ''
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
            {loading ? (isEdit ? t('personnel.forms.buttons.updating') : t('personnel.forms.buttons.creating')) : (isEdit ? t('personnel.forms.buttons.updateContract') : t('personnel.forms.buttons.createContract'))}
          </button>
        </div>
      </form>
    </div>
  );
}
