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

interface SanctionFormData {
  userId: number;
  sanctionType: string;
  reason: string;
  sanctionDate: string;
  durationDays: number;
  decision: string;
  supportingDocument: string;
}

interface SanctionFormProps {
  initialData?: any;
  isEdit?: boolean;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export function SanctionForm({ initialData, isEdit = false, onSubmit, onCancel }: SanctionFormProps) {
  const { t } = useTranslation();
  const { userId: authUserId, effectiveCountryCode } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<SanctionFormData>({
    userId: 0,
    sanctionType: '',
    reason: '',
    sanctionDate: '',
    durationDays: 0,
    decision: '',
    supportingDocument: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.userId || initialData.user?.id || 0,
        sanctionType: initialData.sanctionType || '',
        reason: initialData.reason || '',
        sanctionDate: initialData.sanctionDate ? (initialData.sanctionDate.split('T')[0] || initialData.sanctionDate) : '',
        durationDays: initialData.durationDays || 0,
        decision: initialData.decision || '',
        supportingDocument: initialData.supportingDocument || ''
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationDays' || name === 'userId' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = isEdit 
        ? `/.netlify/functions/personnel-sanctions?id=${initialData?.sanctionId}` 
        : '/.netlify/functions/personnel-sanctions';
        
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
        throw new Error(data.error || (isEdit ? t('personnel.forms.messages.errorUpdate') : t('personnel.forms.messages.errorCreate')) + ' de la sanction');
      }

      setSuccess(`Sanction ${isEdit ? t('personnel.forms.messages.successUpdate') : t('personnel.forms.messages.successCreate')}`);
      
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
      
      // Reset form only when creating new sanction
      if (!isEdit) {
        setFormData({
          userId: 0,
          sanctionType: '',
          reason: '',
          sanctionDate: '',
          durationDays: 0,
          decision: '',
          supportingDocument: ''
        });
      }
    } catch (err: any) {
      setError(err.message || t('personnel.forms.messages.errorUnknown'));
    } finally {
      setLoading(false);
    }
  };

  const isWarningType = formData.sanctionType === 'WARNING';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{isEdit ? t('personnel.forms.titles.editSanction') : t('personnel.forms.titles.createSanction')}</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          {success}
        </div>
      )}
      
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
              {t('personnel.forms.labels.sanctionType')} <span className="text-red-500">*</span>
            </label>
            <select
              name="sanctionType"
              value={formData.sanctionType}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t('personnel.forms.placeholders.selectType')}</option>
              <option value="WARNING">{t('personnel.forms.options.sanctionTypes.WARNING')}</option>
              <option value="SUSPENSION">{t('personnel.forms.options.sanctionTypes.SUSPENSION')}</option>
              <option value="DEMOTION">{t('personnel.forms.options.sanctionTypes.DEMOTION')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('personnel.forms.labels.reason')} <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t('personnel.forms.placeholders.describeReason')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.sanctionDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="sanctionDate"
              value={formData.sanctionDate}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.durationDays')}
            </label>
            <input
              type="number"
              name="durationDays"
              value={formData.durationDays}
              onChange={handleInputChange}
              min="0"
              disabled={isWarningType}
              className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isWarningType ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder={isWarningType ? t('personnel.forms.sanctionMessages.notApplicable') : '0'}
            />
            {isWarningType && (
              <p className="text-xs text-gray-500 mt-1">{t('personnel.forms.sanctionMessages.warningNoDuration')}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('personnel.forms.labels.decision')}
          </label>
          <textarea
            name="decision"
            value={formData.decision}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t('personnel.forms.placeholders.reasonSanction')}
          />
        </div>

        <FileUpload
          label={t('personnel.forms.labels.supportingDocument')}
          value={formData.supportingDocument}
          onChange={(url) => setFormData(prev => ({ ...prev, supportingDocument: url || '' }))}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          useSupabase={false}
        />

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('personnel.forms.buttons.cancel')}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? t('personnel.forms.buttons.loading') : (isEdit ? t('personnel.forms.buttons.updateSanction') : t('personnel.forms.buttons.createSanction'))}
          </button>
        </div>
      </form>
    </div>
  );
}


