import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const STRUCTURE_OPTIONS = ['SITINFRA', 'SITALIA', 'PKBIM', 'GEOTOP', 'SITInfrastructure'];
const WORKCOUNTRY_OPTIONS = ['IVORY_COAST','GHANA','BENIN','CAMEROON','TOGO','ROMANIE','ITALIE','ITALIEPKBIM','GUINEE','BURKINAFASO','SIERRALEONE'];

const Signup: React.FC = () => {
  const [form, setForm] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    workcountry: 'IVORY_COAST',
    structureName: '',
    isStructureResponsible: false,
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!form.email || !form.phone) {
      setError('Les champs marqués d\'un astérisque (*) sont obligatoires');
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/aauth-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Redirect to signin page after successful registration
        navigate('/signin');
      } else {
        setError(data.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Créer un compte</h2>
            <p className="mt-2 text-sm text-gray-600">
              <span className="text-red-500">*</span> Champs obligatoires
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Phone - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rôle <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ROLE_OPTIONS.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Work Country - Required */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays de travail <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.workcountry}
                  onChange={(e) => setForm({ ...form, workcountry: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {WORKCOUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* First Name - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Last Name - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Employee Number - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro d'employé
                </label>
                <input
                  type="text"
                  value={form.employeeNumber}
                  onChange={(e) => setForm({ ...form, employeeNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              {/* Structure Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Structure
                </label>
                <select
                  value={form.structureName}
                  onChange={(e) => setForm({ ...form, structureName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une structure</option>
                  {STRUCTURE_OPTIONS.map((structure) => (
                    <option key={structure} value={structure}>{structure}</option>
                  ))}
                </select>
              </div>

              {/* Is Structure Responsible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsable de structure
                </label>
                <select
                  value={form.isStructureResponsible ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, isStructureResponsible: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 mr-2"
              />
              <label className="text-sm text-gray-600">
                J'accepte les conditions d'utilisation et la politique de confidentialité
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Création du compte...' : 'Créer un compte'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Déjà un compte?{' '}
            <a href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

