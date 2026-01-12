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

interface MedicalRecordFormData {
  userId: number;
  visitDate: string;
  description: string;
  diagnosis: string;
  testsPerformed: string;
  testResults: string;
  prescribedAction: string;
  notes: string;
  nextVisitDate: string;
  medicalFile: string;
}

interface MedicalRecordFormProps {
  initialData?: any;
  isEdit?: boolean;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export function MedicalRecordForm({ initialData, isEdit = false, onSubmit, onCancel }: MedicalRecordFormProps = {}) {
  const { t } = useTranslation();
  const { userId: authUserId, effectiveCountryCode } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<MedicalRecordFormData>({
    userId: 0,
    visitDate: '',
    description: '',
    diagnosis: '',
    testsPerformed: '',
    testResults: '',
    prescribedAction: '',
    notes: '',
    nextVisitDate: '',
    medicalFile: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        userId: initialData.userId || initialData.user?.id || 0,
        visitDate: initialData.visitDate ? initialData.visitDate.split('T')[0] : '',
        description: initialData.description || '',
        diagnosis: initialData.diagnosis || '',
        testsPerformed: initialData.testsPerformed || '',
        testResults: initialData.testResults || '',
        prescribedAction: initialData.prescribedAction || '',
        notes: initialData.notes || '',
        nextVisitDate: initialData.nextVisitDate ? initialData.nextVisitDate.split('T')[0] : '',
        medicalFile: initialData.medicalFile || ''
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

      const medicalRecordId = initialData?.medicalRecordsId;
      const url = medicalRecordId 
        ? `/.netlify/functions/personnel-medical-records?id=${medicalRecordId}`
        : '/.netlify/functions/personnel-medical-records';
      const method = medicalRecordId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || (isEdit ? t('personnel.forms.messages.errorEdit') : t('personnel.forms.messages.errorCreate')) + ' du dossier médical');
      }

      setSuccess(`Dossier médical ${isEdit ? t('personnel.forms.messages.successEdit') : t('personnel.forms.messages.successCreate')}`);
      
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
          visitDate: '',
          description: '',
          diagnosis: '',
          testsPerformed: '',
          testResults: '',
          prescribedAction: '',
          notes: '',
          nextVisitDate: '',
          medicalFile: ''
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
      <h2 className="text-xl font-semibold mb-4">{isEdit ? t('personnel.forms.titles.editMedicalRecord') : t('personnel.forms.titles.createMedicalRecord')}</h2>
      
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
              {t('personnel.forms.labels.visitDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="visitDate"
              value={formData.visitDate}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('personnel.forms.labels.diagnosis')}
          </label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
            rows={2}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t('personnel.forms.placeholders.diagnosisMedical')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.testsPerformed')}
            </label>
            <textarea
              name="testsPerformed"
              value={formData.testsPerformed}
              onChange={handleInputChange}
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('personnel.forms.placeholders.testsPerformedMedical')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.forms.labels.testResults')}
            </label>
            <textarea
              name="testResults"
              value={formData.testResults}
              onChange={handleInputChange}
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder={t('personnel.forms.placeholders.testResultsMedical')}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('personnel.forms.labels.prescribedAction')}
          </label>
          <textarea
            name="prescribedAction"
            value={formData.prescribedAction}
            onChange={handleInputChange}
            rows={2}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t('personnel.forms.placeholders.prescribedActionMedical')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('personnel.forms.labels.notes')}
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder={t('personnel.forms.placeholders.notesMedical')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('personnel.forms.labels.nextVisitDate')}
          </label>
          <input
            type="date"
            name="nextVisitDate"
            value={formData.nextVisitDate}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <FileUpload
          label={t('personnel.forms.labels.medicalFile')}
          value={formData.medicalFile}
          onChange={(url) => setFormData(prev => ({ ...prev, medicalFile: url || '' }))}
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
                visitDate: '',
                description: '',
                diagnosis: '',
                testsPerformed: '',
                testResults: '',
                prescribedAction: '',
                notes: '',
                nextVisitDate: '',
                medicalFile: ''
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
            {loading ? (isEdit ? t('personnel.forms.buttons.updating') : t('personnel.forms.buttons.creating')) : (isEdit ? t('personnel.forms.buttons.updateMedicalRecord') : t('personnel.forms.buttons.createMedicalRecord'))}
          </button>
        </div>
      </form>
    </div>
  );
}
