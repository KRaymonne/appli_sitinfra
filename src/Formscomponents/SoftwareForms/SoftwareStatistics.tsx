import React, { useMemo } from 'react';
import { BarChart, PieChart, TrendingUp, DollarSign, Users, Monitor, FileText } from 'lucide-react';

// Mock data for statistics
const mockSoftwareData = [
  { id: 1, name: 'Microsoft Office 365', type: 'SUBSCRIPTION', licenseCount: 50, usedLicenses: 45, vendor: 'Microsoft' },
  { id: 2, name: 'Adobe Creative Suite', type: 'SUBSCRIPTION', licenseCount: 20, usedLicenses: 18, vendor: 'Adobe' },
  { id: 3, name: 'Autodesk AutoCAD', type: 'LICENSE', licenseCount: 15, usedLicenses: 12, vendor: 'Autodesk' },
  { id: 4, name: 'Slack', type: 'SUBSCRIPTION', licenseCount: 100, usedLicenses: 85, vendor: 'Slack' },
  { id: 5, name: 'Zoom', type: 'SUBSCRIPTION', licenseCount: 75, usedLicenses: 60, vendor: 'Zoom' },
];

const mockVendorData = [
  { vendor: 'Microsoft', count: 3, totalCost: 15000 },
  { vendor: 'Adobe', count: 2, totalCost: 8000 },
  { vendor: 'Autodesk', count: 1, totalCost: 6000 },
  { vendor: 'Slack', count: 1, totalCost: 3000 },
  { vendor: 'Zoom', count: 1, totalCost: 2000 },
];

const mockTypeData = [
  { type: 'SUBSCRIPTION', count: 4, label: 'Abonnements' },
  { type: 'LICENSE', count: 1, label: 'Licences' },
];

const SoftwareStatistics: React.FC = () => {
  // Calculate statistics
  const stats = useMemo(() => {
    const totalSoftware = mockSoftwareData.length;
    const totalLicenses = mockSoftwareData.reduce((sum, software) => sum + software.licenseCount, 0);
    const usedLicenses = mockSoftwareData.reduce((sum, software) => sum + software.usedLicenses, 0);
    const licenseUtilization = totalLicenses > 0 ? Math.round((usedLicenses / totalLicenses) * 100) : 0;
    
    const subscriptionCount = mockSoftwareData.filter(s => s.type === 'SUBSCRIPTION').length;
    const licenseCount = mockSoftwareData.filter(s => s.type === 'LICENSE').length;
    
    const totalCost = mockVendorData.reduce((sum, vendor) => sum + vendor.totalCost, 0);
    
    return {
      totalSoftware,
      totalLicenses,
      usedLicenses,
      licenseUtilization,
      subscriptionCount,
      licenseCount,
      totalCost
    };
  }, []);

  // Get top vendors by software count
  const topVendors = useMemo(() => {
    return [...mockVendorData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, []);

  // Get software utilization data for chart
  const utilizationData = useMemo(() => {
    return mockSoftwareData
      .map(software => ({
        name: software.name,
        utilization: software.licenseCount > 0 
          ? Math.round((software.usedLicenses / software.licenseCount) * 100) 
          : 0
      }))
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 5);
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Monitor className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Logiciels</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSoftware}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Licences Utilisées</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.usedLicenses}/{stats.totalLicenses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Taux d'Utilisation</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.licenseUtilization}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Coût Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCost.toLocaleString('fr-FR')} XAF</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top 5 - Taux d'Utilisation</h3>
          <div className="space-y-4">
            {utilizationData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-gray-500">{item.utilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${item.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Type Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par Type</h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{mockSoftwareData.length}</div>
                  <div className="text-sm text-gray-500">Logiciels</div>
                </div>
              </div>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Subscription slice (75% of circle) */}
                <path
                  d="M50,50 L50,10 A40,40 0 1,1 20,70 Z"
                  fill="#4F46E5"
                  stroke="white"
                  strokeWidth="2"
                />
                {/* License slice (25% of circle) */}
                <path
                  d="M50,50 L20,70 A40,40 0 0,1 50,10 Z"
                  fill="#10B981"
                  stroke="white"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-600 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">
                Abonnements ({stats.subscriptionCount})
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">
                Licences ({stats.licenseCount})
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vendors Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fournisseurs Principaux</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-rose-50">
                  Fournisseur
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-rose-50">
                  Nombre de Logiciels
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-rose-50">
                  Coût Total (XAF)
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-rose-50">
                  Part du Budget
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topVendors.map((vendor, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{vendor.vendor}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{vendor.count}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {vendor.totalCost.toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {stats.totalCost > 0 
                          ? Math.round((vendor.totalCost / stats.totalCost) * 100) 
                          : 0}%
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-rose-600 h-2 rounded-full" 
                          style={{ 
                            width: `${stats.totalCost > 0 
                              ? Math.round((vendor.totalCost / stats.totalCost) * 100) 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SoftwareStatistics;