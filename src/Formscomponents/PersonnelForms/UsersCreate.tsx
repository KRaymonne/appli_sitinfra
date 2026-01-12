import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ROLE_OPTIONS = [
  'SUPER_ADMIN',
  'ADMIN',
  'ACCOUNTANT',
  'DIRECTOR',
  'EMPLOYEE',
  'HR',
  'SECRETARY',
  'TECHNICIAN',
  'DIRECTEUR_TECHNIQUE',
  'DIRECTEUR_ADMINISTRATIF',
  'SENIOR_TECHNICIAN',
  'ENGINEER',
  'EXECUTIVE',
  'INTERN',
  'DRIVER',
  'PRESIDENT_DIRECTEUR_GENERALE',
  'SECRETARIAT',
  'DIRECTION_ADMINISTRATIVE',
  'AUDIT_ET_CONTROLE_DE_GESTION',
  'ADMINISTRATIF_FINANCIER',
  'RESSOURCES_HUMAINES',
  'DIRECTION_COMMERCIALE',
  'DEMARCHE_COMMERCIALE',
  'AMID_DAO',
  'DIRECTION_TECHNIQUE',
  'PROJET_VRD',
  'TOPOGRAPHIE',
  'SIG',
  'ENVIRONNEMENT_SOCIOLOGUE',
  'BD_GENIE',
  'PK_BIM',
  'APP',
  'WEB_MIA',
  'DIRECTION_INFORMATIQUE'
];
const STATUS_OPTIONS = ['ON_HOLIDAY','SUSPENDED','FIRED','ACTIVE'];
const GENDER_OPTIONS = ['MALE','FEMALE'];
const MARITAL_OPTIONS = ['SINGLE','MARRIED','DIVORCED','WIDOWED'];
const IDENTITY_TYPE_OPTIONS = ['NATIONAL_ID_CARD','PASSPORT','DRIVER_LICENSE'];
const STRUCTURE_OPTIONS = ['SITINFRA', 'SITALIA', 'PKBIM', 'GEOTOP', 'SITInfrastructure'];
const WORKCOUNTRY_OPTIONS = ['IVORY_COAST','GHANA','BENIN','CAMEROON','TOGO','ROMANIE','ITALIE','ITALIEPKBIM','GUINEE','BURKINAFASO','SIERRALEONE'];
const DEVISE_OPTIONS = ['XAF','XOF','EUR','GNF','GHS','RON','SLE','USD'];

interface UsersCreateProps {
  onUserCreated?: () => void;
  initialData?: any;
  isEdit?: boolean;
  onCancel?: () => void;
}

export function UsersCreate({ onUserCreated, initialData, isEdit = false, onCancel }: UsersCreateProps = {}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Record<string, any>>({
    employeeNumber: '',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    placeOfBirth: '',
    devise: 'XAF',
    civilityDropdown: 'MALE',
    maritalStatus: 'SINGLE',
    nationality: '',
    identityType: 'NATIONAL_ID_CARD',
    identity: '',
    workcountry: 'IVORY_COAST',
    structureName: '',
    isStructureResponsible: false,
    address: '',
    phone: '',
    phoneno: '',
    gender: 'MALE',
    country: '',
    emergencyName: '',
    emergencyContact: '',
    childrenCount: 0,
    department: '',
    salary: '',
    hireDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        employeeNumber: initialData.employeeNumber || '',
        role: initialData.role || 'EMPLOYEE',
        status: initialData.status || 'ACTIVE',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        password: '', // Don't prefill password for security
        dateOfBirth: initialData.dateOfBirth ? (initialData.dateOfBirth.split('T')[0] || initialData.dateOfBirth) : '',
        placeOfBirth: initialData.placeOfBirth || '',
        devise: initialData.devise || 'XAF',
        civilityDropdown: initialData.civilityDropdown || 'MALE',
        maritalStatus: initialData.maritalStatus || 'SINGLE',
        nationality: initialData.nationality || '',
        identityType: initialData.identityType || 'NATIONAL_ID_CARD',
        identity: initialData.identity || '',
        workcountry: initialData.workcountry || 'IVORY_COAST',
        structureName: initialData.structureName || '',
        isStructureResponsible: initialData.isStructureResponsible || false,
        address: initialData.address || '',
        phone: initialData.phone || '',
        phoneno: initialData.phoneno || '',
        gender: initialData.gender || 'MALE',
        country: initialData.country || '',
        emergencyName: initialData.emergencyName || '',
        emergencyContact: initialData.emergencyContact || '',
        childrenCount: initialData.childrenCount || 0,
        department: initialData.department || '',
        salary: initialData.salary?.toString() || '',
        hireDate: initialData.hireDate ? (initialData.hireDate.split('T')[0] || initialData.hireDate) : '',
      });
    }
  }, [initialData]);

  const requiredKeys = useMemo(() => [
    'employeeNumber','role','status','firstName','lastName','email','dateOfBirth','placeOfBirth','devise','civilityDropdown','maritalStatus','nationality','identityType','identity','workcountry','address','phone','phoneno','gender','country','emergencyName','emergencyContact','department','salary'
  ], []);

  const onChange = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // simple required check - password not required in edit mode
      const keysToCheck = isEdit ? requiredKeys.filter(k => k !== 'password') : requiredKeys;
      const missing = keysToCheck.filter(k => form[k] === '' || form[k] === null || form[k] === undefined);
      if (missing.length) {
        throw new Error(`${t('personnel.forms.messages.missingFields')}: ${missing.join(', ')}`);
      }

      const userId = initialData?.id;
      const url = userId 
        ? `/.netlify/functions/personnel-users?id=${userId}`
        : '/.netlify/functions/personnel-users';
      const method = userId ? 'PUT' : 'POST';
      
      // Prepare payload - exclude password if empty in edit mode
      const payload = { ...form };
      if (isEdit && !payload.password) {
        delete payload.password;
      }
      
      // Ensure structureName and isStructureResponsible are properly included
      payload.structureName = form.structureName || null;
      payload.isStructureResponsible = Boolean(form.isStructureResponsible);

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || (isEdit ? t('personnel.forms.messages.errorEdit') : t('personnel.forms.messages.errorCreate')));
      }
      setSuccess(`Utilisateur ${isEdit ? t('personnel.forms.messages.successEdit') : t('personnel.forms.messages.successCreate')}`);
      // Call the callback to refresh data if provided 
      if (onUserCreated) {
        await onUserCreated();
      }

      // Return to list after successful edit
      if (isEdit && onCancel) {
        setTimeout(() => {
          onCancel();
        }, 1000);
      }

      // reset core fields only when creating, keep values when editing
      if (!isEdit) {
        setForm(prev => ({ ...prev, employeeNumber: '', firstName: '', lastName: '', email: '', password: '', dateOfBirth: '', placeOfBirth: '', nationality: '', identity: '', address: '', phone: '', phoneno: '', country: '', emergencyName: '', emergencyContact: '', childrenCount: 0, department: '', salary: '', hireDate: '' }));
      }
    } catch (err: any) {
      setError(err.message || t('personnel.forms.messages.errorUnknown'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{isEdit ? t('personnel.forms.titles.editUser') : t('personnel.forms.titles.createUser')}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.employeeNumber')}</label>
            <input type="text" value={form.employeeNumber} onChange={(e) => onChange('employeeNumber', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.email')}</label>
            <input type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('personnel.forms.labels.password')} {isEdit && <span className="text-gray-500 text-xs">({t('personnel.forms.labels.passwordHint')})</span>}
            </label>
            <input 
              type="password" 
              value={form.password} 
              onChange={(e) => onChange('password', e.target.value)} 
              className="w-full border rounded px-3 py-2"
              required={!isEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.employeeNumber')}</label>
            <input type="text" value={form.employeeNumber} onChange={(e) => onChange('employeeNumber', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.email')}</label>
            <input type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('personnel.forms.labels.password')} {isEdit && <span className="text-gray-500 text-xs">({t('personnel.forms.labels.passwordHint')})</span>}
            </label>
            <input 
              type="password" 
              value={form.password} 
              onChange={(e) => onChange('password', e.target.value)} 
              className="w-full border rounded px-3 py-2"
              required={!isEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.firstName')}</label>
            <input type="text" value={form.firstName} onChange={(e) => onChange('firstName', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.lastName')}</label>
            <input type="text" value={form.lastName} onChange={(e) => onChange('lastName', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.role')}</label>
            <select value={form.role} onChange={(e) => onChange('role', e.target.value)} className="w-full border rounded px-3 py-2">
              {ROLE_OPTIONS.map(v => <option key={v} value={v}>{t(`personnel.forms.options.roles.${v}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.status')}</label>
            <select value={form.status} onChange={(e) => onChange('status', e.target.value)} className="w-full border rounded px-3 py-2">
              {STATUS_OPTIONS.map(v => <option key={v} value={v}>{t(`personnel.forms.options.statuses.${v}`)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.dateOfBirth')}</label>
            <input type="date" value={form.dateOfBirth} onChange={(e) => onChange('dateOfBirth', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.placeOfBirth')}</label>
            <input type="text" value={form.placeOfBirth} onChange={(e) => onChange('placeOfBirth', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.civility')}</label>
            <select value={form.civilityDropdown} onChange={(e) => onChange('civilityDropdown', e.target.value)} className="w-full border rounded px-3 py-2">
              {GENDER_OPTIONS.map(v => <option key={v} value={v}>{t(`personnel.forms.options.genders.${v}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.maritalStatus')}</label>
            <select value={form.maritalStatus} onChange={(e) => onChange('maritalStatus', e.target.value)} className="w-full border rounded px-3 py-2">
              {MARITAL_OPTIONS.map(v => <option key={v} value={v}>{t(`personnel.forms.options.maritalStatuses.${v}`)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.nationality')}</label>
            <input type="text" value={form.nationality} onChange={(e) => onChange('nationality', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.identityType')}</label>
            <select value={form.identityType} onChange={(e) => onChange('identityType', e.target.value)} className="w-full border rounded px-3 py-2">
              {IDENTITY_TYPE_OPTIONS.map(v => <option key={v} value={v}>{t(`personnel.forms.options.identityTypes.${v}`)}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.identity')}</label>
            <input type="text" value={form.identity} onChange={(e) => onChange('identity', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.workcountry')}</label>
            <select value={form.workcountry} onChange={(e) => onChange('workcountry', e.target.value)} className="w-full border rounded px-3 py-2">
              {WORKCOUNTRY_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Structure</label>
            <select value={form.structureName} onChange={(e) => onChange('structureName', e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Sélectionner une structure</option>
              {STRUCTURE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Responsable de structure</label>
            <select value={form.isStructureResponsible ? 'true' : 'false'} onChange={(e) => onChange('isStructureResponsible', e.target.value === 'true')} className="w-full border rounded px-3 py-2">
              <option value="false">Non</option>
              <option value="true">Oui</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.address')}</label>
            <input type="text" value={form.address} onChange={(e) => onChange('address', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.phone')}</label>
            <input type="text" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.mobile')}</label>
            <input type="text" value={form.phoneno} onChange={(e) => onChange('phoneno', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.currency')}</label>
            <select value={form.devise} onChange={(e) => onChange('devise', e.target.value)} className="w-full border rounded px-3 py-2">
              {DEVISE_OPTIONS.map(v => <option key={v} value={v}>{t(`personnel.forms.options.currencies.${v}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.gender')}</label>
            <select value={form.gender} onChange={(e) => onChange('gender', e.target.value)} className="w-full border rounded px-3 py-2">
              {GENDER_OPTIONS.map(v => <option key={v} value={v}>{t(`personnel.forms.options.genders.${v}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.country')}</label>
            <input type="text" value={form.country} onChange={(e) => onChange('country', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          

          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.emergencyName')}</label>
            <input type="text" value={form.emergencyName} onChange={(e) => onChange('emergencyName', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.emergencyContact')}</label>
            <input type="text" value={form.emergencyContact} onChange={(e) => onChange('emergencyContact', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.childrenCount')}</label>
            <input type="number" value={form.childrenCount} onChange={(e) => onChange('childrenCount', Number(e.target.value))} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.department')}</label>
            <input type="text" value={form.department} onChange={(e) => onChange('department', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.salary')}</label>
            <input type="number" step="0.01" value={form.salary} onChange={(e) => onChange('salary', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('personnel.forms.labels.hireDate')}</label>
            <input type="date" value={form.hireDate} onChange={(e) => onChange('hireDate', e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <div className="flex gap-3">
          {isEdit && onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded text-gray-700 hover:bg-gray-200"
            >
              {t('personnel.forms.buttons.cancel')}
            </button>
          )}
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
            {loading ? t('personnel.forms.buttons.loading') : (isEdit ? t('personnel.forms.buttons.updateUser') : t('personnel.forms.buttons.createUser'))}
          </button>
        </div>
      </form>
    </div>
  );
}

