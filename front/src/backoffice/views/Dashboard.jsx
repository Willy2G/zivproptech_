import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Edit, RefreshCw, Settings, Loader2, Send, Calendar, Download, Eye, Search, Filter } from 'lucide-react';
import StatCard from '../components/ui/StatCard.jsx';
import SoftwareBadge from '../components/ui/SoftwareBadge.jsx';
import { fetchLeads, fetchPosts, fetchVisitorStats } from '../../services/api.js';

const STATUS_PILL = {
  new: { label: 'Nouveau', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  in_progress: { label: 'En cours', badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  closed: { label: 'Traité', badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
};

const QUICK_ACTIONS = [
  { to: '/admin/blog', icon: Edit, label: 'Rédiger un article (SEO)' },
  { to: '/admin/logiciels', icon: RefreshCw, label: 'Mettre à jour les Tarifs' },
  { to: '/admin/seo', icon: Settings, label: 'Modifier les Couleurs' },
];

const PERIOD_PRESETS = [
  { label: 'Tout', value: 'all' },
  { label: '7 jours', value: '7d' },
  { label: '30 jours', value: '30d' },
  { label: '90 jours', value: '90d' },
  { label: 'Personnalisé', value: 'custom' },
];

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🏳️';
  return countryCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

export default function Dashboard() {
  const [allLeads, setAllLeads] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodPreset, setPeriodPreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [visitorStats, setVisitorStats] = useState([]);

  useEffect(() => {
    Promise.all([fetchLeads(), fetchPosts().catch(() => [])])
      .then(([leadsData, postsData]) => {
        setAllLeads(leadsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        setAllPosts(postsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchVisitorStats(dateFrom, dateTo)
      .then(setVisitorStats)
      .catch(console.error);
  }, [dateFrom, dateTo]);

  const handlePreset = (preset) => {
    setPeriodPreset(preset);
    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else if (preset !== 'custom') {
      const days = parseInt(preset);
      const now = new Date();
      const from = new Date(now);
      from.setDate(from.getDate() - days);
      setDateFrom(toISODate(from));
      setDateTo(toISODate(now));
    }
  };

  const periodLeads = useMemo(() => {
    if (!dateFrom && !dateTo) return allLeads;
    return allLeads.filter(l => {
      const d = new Date(l.created_at);
      if (dateFrom && d < new Date(dateFrom + 'T00:00:00')) return false;
      if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [allLeads, dateFrom, dateTo]);

  const periodPosts = useMemo(() => {
    if (!dateFrom && !dateTo) return allPosts;
    return allPosts.filter(p => {
      const d = new Date(p.created_at);
      if (dateFrom && d < new Date(dateFrom + 'T00:00:00')) return false;
      if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [allPosts, dateFrom, dateTo]);

  const filteredLeads = periodLeads.filter(lead =>
    lead.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.software_interest?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const guideDownloads = periodLeads.filter(l => l.software_interest === 'Guide Digitalisation').length;
  const standardLeads = periodLeads.length - guideDownloads;
  const newLeadsCount = periodLeads.filter(l => l.status === 'new').length;
  const blogViews = periodPosts.reduce((acc, post) => acc + (post.views_count || 0), 0);

  const dynamicStats = [
    { label: 'Démos & RDV Demandés', value: standardLeads.toString(), icon: Send, iconBg: 'bg-blue-50', iconText: 'text-ziv-blue', trend: `${newLeadsCount} nouveaux`, trendPositive: newLeadsCount > 0 },
    { label: 'Téléchargements Guide', value: guideDownloads.toString(), icon: Download, iconBg: 'bg-yellow-50', iconText: 'text-yellow-600', trend: 'Leads générés (Email)', trendPositive: true },
    { label: 'Vues du Blog (SEO)', value: blogViews.toString(), icon: Eye, iconBg: 'bg-teal-50', iconText: 'text-teal-600', trend: `${periodPosts.length} articles`, trendPositive: true },
    { label: 'Total Contacts CRM', value: periodLeads.length.toString(), icon: Calendar, iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', trend: 'Base de données', trendPositive: true },
  ];

  const periodLabel = periodPreset === 'all' ? 'Toutes les données' : periodPreset === 'custom' ? `${dateFrom || '…'} → ${dateTo || '…'}` : `${PERIOD_PRESETS.find(p => p.value === periodPreset)?.label}`;

  const totalVisitors = visitorStats.reduce((sum, row) => sum + (parseInt(row.unique_visitors, 10) || 0), 0);

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-700">Période :</span>
            <div className="flex flex-wrap gap-1.5">
              {PERIOD_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => handlePreset(p.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${periodPreset === p.value ? 'bg-ziv-cyan text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          {(periodPreset === 'custom' || dateFrom || dateTo) && (
            <div className="flex items-center gap-2 text-sm">
              <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPeriodPreset('custom'); }} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ziv-cyan" />
              <span className="text-gray-400">→</span>
              <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPeriodPreset('custom'); }} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ziv-cyan" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dynamicStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              Demandes (Leads)
              <span className="ml-2 text-xs font-normal text-gray-400">{periodLabel}</span>
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-ziv-cyan w-full sm:w-48"
                />
              </div>
              <Link to="/admin/crm" className="text-sm text-ziv-cyan font-medium hover:text-cyan-700 whitespace-nowrap">
                Voir le CRM
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center text-gray-500 py-10">Aucun lead trouvé sur cette période.</div>
            ) : (
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Contact</th>
                    <th className="px-4 py-3">Intérêt</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 rounded-tr-lg">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.slice(0, 10).map((lead) => {
                    const pill = STATUS_PILL[lead.status] || STATUS_PILL.new;
                    return (
                      <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium text-gray-900">{lead.full_name}</td>
                        <td className="px-4 py-4"><SoftwareBadge value={lead.software_interest} /></td>
                        <td className="px-4 py-4">{formatDate(lead.created_at)}</td>
                        <td className="px-4 py-4">
                          <span className={`${pill.badge} px-2.5 py-1 rounded-full text-xs font-medium flex w-max items-center`}>
                            <i className={`w-1.5 h-1.5 rounded-full ${pill.dot} mr-1.5`} /> {pill.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Actions Rapides</h3>
          <div className="space-y-3">
            {QUICK_ACTIONS.map(({ to, icon: Ico, label }) => (
              <Link
                key={to}
                to={to}
                className="w-full flex items-center p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-ziv-cyan hover:text-white transition-colors border border-gray-100 hover:border-transparent group"
              >
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mr-3 group-hover:text-ziv-cyan text-gray-400 shadow-sm">
                  <Ico className="h-4 w-4" />
                </div>
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Répartition Statuts</h4>
            {['new', 'in_progress', 'closed'].map(status => {
              const count = periodLeads.filter(l => l.status === status).length;
              const pct = periodLeads.length ? Math.round((count / periodLeads.length) * 100) : 0;
              const pill = STATUS_PILL[status];
              return (
                <div key={status} className="mb-2 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">{pill.label}</span>
                    <span className="font-bold text-gray-800">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`${pill.dot} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Trafic par Pays (Top 5)</h3>
            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              {periodLabel}
            </span>
          </div>
          <div className="space-y-5">
            {visitorStats.slice(0, 5).map((row) => {
              const count = parseInt(row.unique_visitors, 10) || 0;
              const percent = totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0;
              return (
              <div key={row.country_code} className="flex items-center">
                <span className="text-2xl mr-4 shadow-sm rounded-sm">{getFlagEmoji(row.country_code)}</span>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-bold text-gray-800">{row.country_name || row.country_code}</span>
                    <span className={`text-sm font-bold ${percent >= 50 ? 'text-ziv-cyan' : 'text-gray-600'}`}>
                      {percent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`${percent >= 50 ? 'bg-ziv-cyan' : 'bg-ziv-blue'} h-2 rounded-full`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            )})}
            {visitorStats.length === 0 && <div className="text-sm text-gray-500 text-center py-4">Aucune donnée sur cette période</div>}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <BarChart2 className="h-8 w-8 text-ziv-blue" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Connecter Google Analytics</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Pour des données en temps réel sur l'acquisition de vos leads, reliez votre compte
            Analytics 4 dans la section SEO.
          </p>
          <Link
            to="/admin/seo"
            className="bg-ziv-blue hover:bg-blue-800 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm shadow-sm"
          >
            Configurer le Tracking
          </Link>
        </div>
      </div>
    </>
  );
}
