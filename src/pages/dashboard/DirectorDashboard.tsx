import { BarChart3, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';

export function DirectorDashboard() {
  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Directeur</h1>
          <p className="mt-2 text-gray-600">Vue d'ensemble stratégique</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Croissance</p>
                <p className="text-2xl font-bold text-gray-900">+15%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus</p>
                <p className="text-2xl font-bold text-gray-900">5.2M</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Équipe</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Projets</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Aperçu stratégique</h2>
            <div className="space-y-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left w-full">
                <BarChart3 className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-semibold">Analyse financière</p>
                <p className="text-sm text-gray-600">Rapports détaillés</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left w-full">
                <Users className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-semibold">Équipe et ressources</p>
                <p className="text-sm text-gray-600">Gestion du personnel</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prochaines échéances</h2>
            <div className="space-y-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left w-full">
                <Calendar className="w-6 h-6 text-orange-600 mb-2" />
                <p className="font-semibold">Réunions importantes</p>
                <p className="text-sm text-gray-600">Cette semaine</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left w-full">
                <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
                <p className="font-semibold">Objectifs trimestriels</p>
                <p className="text-sm text-gray-600">Suivi et performance</p>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}

