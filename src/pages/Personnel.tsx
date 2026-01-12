import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FilePlus
} from 'lucide-react';

// Import form components
import { ContractForm } from '../Formscomponents/PersonnelForms/ContractForm';
import { AbsenceForm } from '../Formscomponents/PersonnelForms/AbsenceForm';
import { BonusForm } from '../Formscomponents/PersonnelForms/BonusForm';
import { SanctionForm } from '../Formscomponents/PersonnelForms/SanctionForm';
import { MedicalRecordForm } from '../Formscomponents/PersonnelForms/MedicalRecordForm';
import { AffectationForm } from '../Formscomponents/PersonnelForms/AffectationForm';
import { UsersCreate } from '../Formscomponents/PersonnelForms/UsersCreate';

// Import list components
import {
  UserList,
  ContractList,
  AbsenceList,
  BonusList,
  SanctionList,
  MedicalRecordList,
  AffectationList
} from '../Formscomponents/PersonnelForms/lists';


// Data types
interface User {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  status: string;
  dateOfBirth: string;
  placeOfBirth: string;
  devise: string;
  civilityDropdown: string;
  maritalStatus: string;
  nationality: string;
  identityType: string;
  identity: string;
  workcountry: string;
  structureName: string | null;
  isStructureResponsible: boolean;
  address: string;
  phone: string;
  phoneno: string;
  gender: string;
  country: string;
  emergencyName: string;
  emergencyContact: string;
  childrenCount: number;
  department: string;
  salary: number;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

interface Contract {
  contractId: number;
  userId: number;
  contractType: string;
  startDate: string;
  endDate: string | null;
  post: string;
  department: string;
  unit: string | null;
  grossSalary: number;
  netSalary: number;
  currency: string;
  contractFile: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

interface Absence {
  absenceId: number;
  userId: number;
  absenceType: string;
  description: string | null;
  startDate: string;
  endDate: string;
  daysCount: number;
  returnDate: string;
  supportingDocument: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

interface Bonus {
  bonusId: number;
  userId: number;
  bonusType: string;
  amount: number;
  currency: string;
  awardDate: string;
  reason: string | null;
  paymentMethod: string;
  status: string;
  supportingDocument: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

interface Sanction {
  sanctionId: number;
  userId: number;
  sanctionType: string;
  reason: string;
  sanctionDate: string;
  durationDays: number | null;
  decision: string | null;
  supportingDocument: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

interface MedicalRecord {
  medicalRecordsId: number;
  userId: number;
  visitDate: string;
  description: string | null;
  diagnosis: string | null;
  testsPerformed: string | null;
  testResults: string | null;
  prescribedAction: string | null;
  notes: string | null;
  nextVisitDate: string | null;
  medicalFile: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

interface Affectation {
  affectationsId: number;
  userId: number;
  workLocation: string;
  site: string;
  affectationtype: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  attached_file: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

// Tab identifiers - constants for business logic
const TAB_IDS = {
  PERSONAL_INFO: 'personalInfo',
  CONTRACTS: 'contracts',
  AFFECTATIONS: 'affectations',
  ABSENCES: 'absences',
  BONUSES: 'bonuses',
  SANCTIONS: 'sanctions',
  MEDICAL_RECORD: 'medicalRecord',
  CREATION: 'creation'
} as const;

export function Personnel() {
  const { t } = useTranslation();
  const [activeMainTab, setActiveMainTab] = useState<string>(TAB_IDS.PERSONAL_INFO);
  const [activeTab, setActiveTab] = useState<string>(TAB_IDS.PERSONAL_INFO);
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [affectations, setAffectations] = useState<Affectation[]>([]);
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Editing state
  const [editingItem, setEditingItem] = useState<any>(null);

  // Country filter state
  const [insertCountryFilter, setInsertCountryFilter] = useState<string>('');
  const WORKCOUNTRY_OPTIONS = ['IVORY_COAST','GHANA','BENIN','CAMEROON','TOGO','ROMANIE','ITALIE'];

  // Tab configuration with IDs and translations
  const tabConfig = [
    { id: TAB_IDS.PERSONAL_INFO, label: t('personnel.tabs.personalInfo') },
    { id: TAB_IDS.CONTRACTS, label: t('personnel.tabs.contracts') },
    { id: TAB_IDS.AFFECTATIONS, label: t('personnel.tabs.affectations') },
    { id: TAB_IDS.ABSENCES, label: t('personnel.tabs.absences') },
    { id: TAB_IDS.BONUSES, label: t('personnel.tabs.bonuses') },
    { id: TAB_IDS.SANCTIONS, label: t('personnel.tabs.sanctions') },
    { id: TAB_IDS.MEDICAL_RECORD, label: t('personnel.tabs.medicalRecord') }
  ];
  
  // For display purposes only
  const tabs = tabConfig.map(tab => tab.label);

  // Data fetching functions
  const fetchUsers = async () => {
    try {
      const response = await fetch('/.netlify/functions/personnel-users');
      if (!response.ok) {
        console.error('Failed to fetch users, status:', response.status);
        return;
      }
      const data = await response.json();
      console.log('Users fetched:', data);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  const fetchContracts = async () => {
    try {
      const url = insertCountryFilter 
        ? `/.netlify/functions/personnel-contracts?InserterCountry=${insertCountryFilter}`
        : '/.netlify/functions/personnel-contracts';
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch contracts, status:', response.status);
        return;
      }
      const data = await response.json();
      console.log('Contracts fetched:', data);
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setContracts([]);
    }
  };

  const fetchAbsences = async () => {
    try {
      const url = insertCountryFilter 
        ? `/.netlify/functions/personnel-absences?InserterCountry=${insertCountryFilter}`
        : '/.netlify/functions/personnel-absences';
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch absences, status:', response.status);
        return;
      }
      const data = await response.json();
      console.log('Absences fetched:', data);
      setAbsences(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching absences:', err);
      setAbsences([]);
    }
  };

  const fetchBonuses = async () => {
    try {
      const url = insertCountryFilter 
        ? `/.netlify/functions/personnel-bonuses?InserterCountry=${insertCountryFilter}`
        : '/.netlify/functions/personnel-bonuses';
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch bonuses, status:', response.status);
        return;
      }
      const data = await response.json();
      console.log('Bonuses fetched:', data);
      setBonuses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching bonuses:', err);
      setBonuses([]);
    }
  };

  const fetchSanctions = async () => {
    try {
      const url = insertCountryFilter 
        ? `/.netlify/functions/personnel-sanctions?InserterCountry=${insertCountryFilter}`
        : '/.netlify/functions/personnel-sanctions';
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch sanctions, status:', response.status);
        return;
      }
      const data = await response.json();
      console.log('Sanctions fetched:', data);
      setSanctions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching sanctions:', err);
      setSanctions([]);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const url = insertCountryFilter 
        ? `/.netlify/functions/personnel-medical-records?InserterCountry=${insertCountryFilter}`
        : '/.netlify/functions/personnel-medical-records';
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch medical records, status:', response.status);
        return;
      }
      const data = await response.json();
      console.log('Medical records fetched:', data);
      setMedicalRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching medical records:', err);
      setMedicalRecords([]);
    }
  };

  const fetchAffectations = async () => {
    try {
      const url = insertCountryFilter 
        ? `/.netlify/functions/personnel-affectations?InserterCountry=${insertCountryFilter}`
        : '/.netlify/functions/personnel-affectations';
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch affectations, status:', response.status);
        return;
      }
      const data = await response.json();
      console.log('Affectations fetched:', data);
      setAffectations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching affectations:', err);
      setAffectations([]);
    }
  };

  // Load data only for the active tab
  useEffect(() => {
    const loadDataForTab = async () => {
      if (activeMainTab === TAB_IDS.CREATION) return; // Don't load when in creation mode
      
      setLoading(true);
      try {
        switch (activeTab) {
          case TAB_IDS.PERSONAL_INFO:
            await fetchUsers();
            break;
          case TAB_IDS.CONTRACTS:
            await fetchContracts();
            break;
          case TAB_IDS.AFFECTATIONS:
            await fetchAffectations();
            break;
          case TAB_IDS.ABSENCES:
            await fetchAbsences();
            break;
          case TAB_IDS.BONUSES:
            await fetchBonuses();
            break;
          case TAB_IDS.SANCTIONS:
            await fetchSanctions();
            break;
          case TAB_IDS.MEDICAL_RECORD:
            await fetchMedicalRecords();
            break;
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDataForTab();
  }, [activeTab, activeMainTab, insertCountryFilter]);

  // Reset editing item when switching away from creation
  useEffect(() => {
    if (activeMainTab !== TAB_IDS.CREATION) {
      setEditingItem(null);
    }
  }, [activeMainTab]);

  // Handle view action
  const handleView = () => {
    // Handled by individual list components
  };

  // Handle edit action
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setActiveMainTab(TAB_IDS.CREATION);
  };

  // Handle delete action
  const handleDelete = async (id: number) => {
    try {
      let endpoint = '';
      let fetchFn: () => Promise<void>;

      switch (activeTab) {
        case TAB_IDS.PERSONAL_INFO:
          endpoint = `/.netlify/functions/personnel-users?id=${id}`;
          fetchFn = fetchUsers;
          break;
        case TAB_IDS.CONTRACTS:
          endpoint = `/.netlify/functions/personnel-contracts?id=${id}`;
          fetchFn = fetchContracts;
          break;
        case TAB_IDS.AFFECTATIONS:
          endpoint = `/.netlify/functions/personnel-affectations?id=${id}`;
          fetchFn = fetchAffectations;
          break;
        case TAB_IDS.ABSENCES:
          endpoint = `/.netlify/functions/personnel-absences?id=${id}`;
          fetchFn = fetchAbsences;
          break;
        case TAB_IDS.BONUSES:
          endpoint = `/.netlify/functions/personnel-bonuses?id=${id}`;
          fetchFn = fetchBonuses;
          break;
        case TAB_IDS.SANCTIONS:
          endpoint = `/.netlify/functions/personnel-sanctions?id=${id}`;
          fetchFn = fetchSanctions;
          break;
        case TAB_IDS.MEDICAL_RECORD:
          endpoint = `/.netlify/functions/personnel-medical-records?id=${id}`;
          fetchFn = fetchMedicalRecords;
          break;
        default:
          return;
      }

      if (endpoint) {
        const response = await fetch(endpoint, { method: 'DELETE' });
        if (response.ok) {
          await fetchFn();
          console.log('Item deleted successfully');
        } else {
          console.error('Failed to delete item');
        }
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Get filtered data based on active tab
  const getCurrentData = () => {
    const applyFilter = (arr: any[]) => insertCountryFilter 
      ? arr.filter((x: any) => x.InserterCountry === insertCountryFilter) 
      : arr;

    switch (activeTab) {
      case TAB_IDS.CONTRACTS:
        return applyFilter(contracts);
      case TAB_IDS.AFFECTATIONS:
        return applyFilter(affectations);
      case TAB_IDS.ABSENCES:
        return applyFilter(absences);
      case TAB_IDS.BONUSES:
        return applyFilter(bonuses);
      case TAB_IDS.SANCTIONS:
        return applyFilter(sanctions);
      case TAB_IDS.MEDICAL_RECORD:
        return applyFilter(medicalRecords);
      case TAB_IDS.PERSONAL_INFO:
        return users;
      default:
        return [];
    }
  };

  // Render list component based on active tab
  const renderList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-gray-500">{t('personnel.loading')}</div>
          </div>
        </div>
      );
    }

    const currentData = getCurrentData();

    switch (activeTab) {
      case TAB_IDS.PERSONAL_INFO:
        return (
          <UserList
            users={currentData as User[]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        );
      case TAB_IDS.CONTRACTS:
        return (
          <ContractList
            contracts={currentData as Contract[]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        );
      case TAB_IDS.AFFECTATIONS:
        return (
          <AffectationList
            affectations={currentData as Affectation[]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        );
      case TAB_IDS.ABSENCES:
        return (
          <AbsenceList
            absences={currentData as Absence[]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        );
      case TAB_IDS.BONUSES:
        return (
          <BonusList
            bonuses={currentData as Bonus[]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        );
      case TAB_IDS.SANCTIONS:
        return (
          <SanctionList
            sanctions={currentData as Sanction[]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        );
      case TAB_IDS.MEDICAL_RECORD:
        return (
          <MedicalRecordList
            medicalRecords={currentData as MedicalRecord[]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        );
      default:
        return <div className="text-center py-8 text-gray-500">{t('common.noData')}</div>;
    }
  };

  // Contenu pour chaque page de création
  const renderCreationPageContent = () => {
    const isEdit = !!editingItem;
    
    switch (activeTab) {
      case TAB_IDS.SANCTIONS:
        return <SanctionForm initialData={editingItem} isEdit={isEdit} onSubmit={fetchSanctions} onCancel={() => setActiveMainTab(activeTab)} />;
      case TAB_IDS.BONUSES:
        return <BonusForm initialData={editingItem} isEdit={isEdit} onSubmit={fetchBonuses} onCancel={() => setActiveMainTab(activeTab)} />;
      case TAB_IDS.ABSENCES:
        return <AbsenceForm initialData={editingItem} isEdit={isEdit} onSubmit={fetchAbsences} onCancel={() => setActiveMainTab(activeTab)} />;
      case TAB_IDS.MEDICAL_RECORD:  
        return <MedicalRecordForm initialData={editingItem} isEdit={isEdit} onSubmit={fetchMedicalRecords} onCancel={() => setActiveMainTab(activeTab)} />;
      case TAB_IDS.CONTRACTS: 
        return <ContractForm initialData={editingItem} isEdit={isEdit} onSubmit={fetchContracts} onCancel={() => setActiveMainTab(activeTab)} />;
      case TAB_IDS.AFFECTATIONS: 
        return <AffectationForm initialData={editingItem} isEdit={isEdit} onSubmit={fetchAffectations} onCancel={() => setActiveMainTab(activeTab)} />;
      case TAB_IDS.PERSONAL_INFO:
        return <UsersCreate onUserCreated={fetchUsers} initialData={editingItem} isEdit={isEdit} onCancel={() => setActiveMainTab(activeTab)} />;
      default:
        return <div>{t('common.noData')}</div>;
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
       
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {/* Header avec title */}
          <div className="mb-4 md:mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-600 flex items-center space-x-2">
              <span>{t('personnel.title').toUpperCase()}</span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <div className="px-4 py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">{t('personnel.title')}</h2>
                <button
                  onClick={() => setActiveMainTab(TAB_IDS.CREATION)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm flex items-center space-x-2 transition-colors"
                >
                  <FilePlus size={16} />
                  <span>{t('personnel.user.create')}</span>
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              {/* Secondary Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex -mb-px overflow-x-auto">
                  {tabConfig.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setActiveMainTab(tab.id);
                      }}
                      className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id && activeMainTab !== TAB_IDS.CREATION
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

  

              {/* Content */}
              {activeMainTab === TAB_IDS.CREATION ? (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <button
                      onClick={() => setActiveMainTab(activeTab)}
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>{t('common.close')}</span>
                    </button>
                  </div>
                  {editingItem && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        {t('personnel.user.edit')}
                      </p>
                    </div>
                  )}
                  {renderCreationPageContent()}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end items-center space-x-3">
                    {(activeTab === TAB_IDS.CONTRACTS || activeTab === TAB_IDS.AFFECTATIONS || activeTab === TAB_IDS.ABSENCES || 
                      activeTab === TAB_IDS.BONUSES || activeTab === TAB_IDS.SANCTIONS || activeTab === TAB_IDS.MEDICAL_RECORD) && (
                      <select
                        value={insertCountryFilter}
                        onChange={(e) => setInsertCountryFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Tous les pays (InserterCountry)</option>
                        {WORKCOUNTRY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    )}
                    <button 
                      onClick={() => {
                        setActiveMainTab(TAB_IDS.CREATION);
                        setEditingItem(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center space-x-2 transition-colors"
                    >
                      <FilePlus size={16} />
                      <span>{t('common.create')}</span>
                    </button>
                  </div>
                  
                  {renderList()}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}

function App() {
  return <Personnel />;
}

export default App;