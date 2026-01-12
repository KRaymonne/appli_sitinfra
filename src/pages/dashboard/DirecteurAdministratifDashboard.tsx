import { BarChart3, TrendingUp, Users, DollarSign, FileText, Banknote } from 'lucide-react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';

export function DirecteurAdministratifDashboard() {
  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Directeur Administratif</h1>
          <p className="mt-2 text-gray-600">Gestion administrative et financière</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus</p>
                <p className="text-2xl font-bold text-gray-900">5.2M</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Factures</p>
                <p className="text-2xl font-bold text-gray-900">42</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Banknote className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Banques</p>
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Personnel</p>
                <p className="text-2xl font-bold text-gray-900">28</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestion financière</h2>
            <div className="space-y-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left w-full">
                <FileText className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-semibold">Factures et paiements</p>
                <p className="text-sm text-gray-600">Suivi financier</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left w-full">
                <Banknote className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-semibold">Comptes bancaires</p>
                <p className="text-sm text-gray-600">Gestion des banques</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Rapports administratifs</h2>
            <div className="space-y-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left w-full">
                <BarChart3 className="w-6 h-6 text-orange-600 mb-2" />
                <p className="font-semibold">Analyse financière</p>
                <p className="text-sm text-gray-600">Rapports détaillés</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left w-full">
                <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                <p className="font-semibold">Indicateurs de performance</p>
                <p className="text-sm text-gray-600">Métriques administratives</p>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}

