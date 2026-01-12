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

interface AbsenceFormData {
  userId: number;
  absenceType: string;
  description: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  returnDate: string;
  supportingDocument: string;
}

interface AbsenceFormProps {
  initialData?: any;
  isEdit?: boolean;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export function AbsenceForm({ initialData, isEdit = false, onSubmit, onCancel }: AbsenceFormProps = {}) {
  const { t } = useTranslation();
  const { userId: authUserId, effectiveCountryCode } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<AbsenceFormData>({
    userId: 0,
    absenceType: '',
    description: '',
    startDate: '',
    endDate: '',
    daysCount: 0,
    returnDate: '',
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
        absenceType: initialData.absenceType || '',
        description: initialData.description || '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        daysCount: initialData.daysCount || 0,
        returnDate: initialData.returnDate ? initialData.returnDate.split('T')[0] : '',
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

  // Calculate days count when start and end dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      setFormData(prev => ({ ...prev, daysCount: diffDays }));
    }
  }, [formData.startDate, formData.endDate]);

  // Calculate return date (next working day after end date)
  useEffect(() => {
    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      const returnDate = new Date(endDate);
      returnDate.setDate(returnDate.getDate() + 1);
      setFormData(prev => ({ ...prev, returnDate: returnDate.toISOString().split('T')[0] }));
    }
  }, [formData.endDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'daysCount' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = isEdit 
        ? `/.netlify/functions/personnel-absences?id=${initialData?.absenceId}` 
        : '/.netlify/functions/personnel-absences';
        
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
        throw new Error(data.error || (isEdit ? t('personnel.forms.messages.errorUpdate') : t('personnel.forms.messages.errorCreate')) + ' de l\'absence');
      }

      setSuccess(`Absence ${isEdit ? t('personnel.forms.messages.successUpdate') : t('personnel.forms.messages.successCreate')}`);
      
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
      
      // Reset form only when creating new absence
      if (!isEdit) {
        setFormData({
          userId: 0,
          absenceType: '',
          description: '',
          startDate: '',
          endDate: '',
          daysCount: 0,
          returnDate: '',
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
      <h2 className="text-xl font-semibold mb-4">{isEdit ? t('personnel.forms.titles.editAbsence') : t('personnel.forms.titles.createAbsence')}</h2>
      
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
              {t('personnel.forms.labels.absenceType')} <span className="text-red-500">*</span>
            </label>
            <select
              name="absenceType"
              value={formData.absenceType}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">{t('personnel.forms.placeholders.selectType')}</option>
              <option value="ILLNESS">{t('personnel.forms.options.absenceTypes.ILLNESS')}</option>
              <option value="ANNUAL_LEAVE">{t('personnel.forms.options.absenceTypes.ANNUAL_LEAVE')}</option>
              <option value="AUTHORIZED_LEAVE">{t('personnel.forms.options.absenceTypes.AUTHORIZED_LEAVE')}</option>
              <option value="HALF_DAY">{t('personnel.forms.options.absenceTypes.HALF_DAY')}</option>
              <option value="UNJUSTIFIED_LEAVE">{t('personnel.forms.options.absenceTypes.UNJUSTIFIED_LEAVE')}</option>
              <option value="MATERNITY_LEAVE">{t('personnel.forms.options.absenceTypes.MATERNITY_LEAVE')}</option>
            </select>
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
            placeholder={t('personnel.forms.placeholders.describeReason')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              {t('personnel.forms.labels.endDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.daysCount')}
            </label>
            <input
              type="number"
              name="daysCount"
              value={formData.daysCount}
              onChange={handleInputChange}
              min="1"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('personnel.forms.labels.returnDate')}
          </label>
          <input
            type="date"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
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
                absenceType: '',
                description: '',
                startDate: '',
                endDate: '',
                daysCount: 0,
                returnDate: '',
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
            {loading ? t('personnel.forms.buttons.loading') : (isEdit ? t('personnel.forms.buttons.updateAbsence') : t('personnel.forms.buttons.createAbsence'))}
          </button>
        </div>
      </form>
    </div>
  );
}
