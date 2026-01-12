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

interface AffectationFormData {
  userId: number;
  workLocation: string;
  site: string;
  affectationtype: string;
  description: string;
  startDate: string;
  endDate: string;
  attached_file: string;
}

interface AffectationFormProps {
  initialData?: any;
  isEdit?: boolean;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export function AffectationForm({ initialData, isEdit = false, onSubmit, onCancel }: AffectationFormProps = {}) {
  const { t } = useTranslation();
  const { userId: authUserId, effectiveCountryCode } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<AffectationFormData>({
    userId: 0,
    workLocation: '',
    site: '',
    affectationtype: '',
    description: '',
    startDate: '',
    endDate: '',
    attached_file: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.userId || initialData.user?.id || 0,
        workLocation: initialData.workLocation || '',
        site: initialData.site || '',
        affectationtype: initialData.affectationtype || '',
        description: initialData.description || '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        attached_file: initialData.attached_file || ''
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
      [name]: value
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
      const affectationId = initialData?.affectationsId;
      const url = affectationId 
        ? `/.netlify/functions/personnel-affectations?id=${affectationId}`
        : '/.netlify/functions/personnel-affectations';
      const method = affectationId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || (isEdit ? t('personnel.forms.messages.errorEdit') : t('personnel.forms.messages.errorCreate')) + ' de l\'affectation');
      }

      setSuccess(`Affectation ${isEdit ? t('personnel.forms.messages.successEdit') : t('personnel.forms.messages.successCreate')}`);
      
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
          workLocation: '',
          site: '',
          affectationtype: '',
          description: '',
          startDate: '',
          endDate: '',
          attached_file: ''
        });
      }
    } catch (err: any) {
      setError(err.message || t('personnel.forms.messages.errorUnknown'));
    } finally {
      setLoading(false);
    }
  };

  const isPermanentType = formData.affectationtype === 'PERMANENT';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{isEdit ? t('personnel.forms.titles.editAffectation') : t('personnel.forms.titles.createAffectation')}</h2>
      
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
              {t('personnel.forms.labels.affectationType')} <span className="text-red-500">*</span>
            </label>
            <select
              name="affectationtype"
              value={formData.affectationtype}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t('personnel.forms.placeholders.selectType')}</option>
              <option value="PERMANENT">{t('personnel.forms.options.affectationTypes.PERMANENT')}</option>
              <option value="TEMPORARY">{t('personnel.forms.options.affectationTypes.TEMPORARY')}</option>
              <option value="TRANSFER">{t('personnel.forms.options.affectationTypes.TRANSFER')}</option>
              <option value="PROJECT_BASED">{t('personnel.forms.options.affectationTypes.PROJECT_BASED')}</option>
              <option value="SPECIAL_ASSIGNMENT">{t('personnel.forms.options.affectationTypes.SPECIAL_ASSIGNMENT')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.workLocation')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="workLocation"
              value={formData.workLocation}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('personnel.forms.placeholders.workLocationExample')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.site')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="site"
              value={formData.site}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('personnel.forms.placeholders.siteExample')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('personnel.forms.labels.description')}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t('personnel.forms.placeholders.descriptionAffectation')}
          />
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
              disabled={isPermanentType}
              className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isPermanentType ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {isPermanentType && (
              <p className="text-xs text-gray-500 mt-1">{t('personnel.forms.sanctionMessages.permanentNoEndDate')}</p>
            )}
          </div>
        </div>

        <FileUpload
          label={t('personnel.forms.labels.attachedFile')}
          value={formData.attached_file}
          onChange={(url) => setFormData(prev => ({ ...prev, attached_file: url || '' }))}
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
                workLocation: '',
                site: '',
                affectationtype: '',
                description: '',
                startDate: '',
                endDate: '',
                attached_file: ''
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
            {loading ? (isEdit ? t('personnel.forms.buttons.updating') : t('personnel.forms.buttons.creating')) : (isEdit ? t('personnel.forms.buttons.updateAffectation') : t('personnel.forms.buttons.createAffectation'))}
          </button>
        </div>
      </form>
    </div>
  );
}
