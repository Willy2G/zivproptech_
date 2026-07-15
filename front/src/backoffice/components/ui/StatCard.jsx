import { TrendingUp } from 'lucide-react';

// Carte KPI du tableau de bord.
export default function StatCard({ stat }) {
  const { label, value, icon: Ico, iconBg, iconText, trend, trendPositive } = stat;
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 ${iconBg} rounded-lg ${iconText}`}>
          <Ico className="h-6 w-6" />
        </div>
      </div>
      <p
        className={`text-xs mt-4 flex items-center font-medium ${
          trendPositive ? 'text-green-600' : 'text-gray-500'
        }`}
      >
        {trendPositive && <TrendingUp className="h-3 w-3 mr-1" />}
        {trend}
      </p>
    </div>
  );
}
