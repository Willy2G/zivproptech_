import { Calendar, Download, Eye, Send } from 'lucide-react';

// Cartes statistiques (KPIs) du tableau de bord.
export const stats = [
  {
    label: 'Démos Demandées',
    value: '42',
    icon: Send,
    iconBg: 'bg-blue-50',
    iconText: 'text-ziv-blue',
    trend: '+12% ce mois',
    trendPositive: true,
  },
  {
    label: 'Rendez-vous B2B',
    value: '18',
    icon: Calendar,
    iconBg: 'bg-indigo-50',
    iconText: 'text-indigo-600',
    trend: '+4 cette semaine',
    trendPositive: true,
  },
  {
    label: 'Téléchargements Guide',
    value: '1,248',
    icon: Download,
    iconBg: 'bg-yellow-50',
    iconText: 'text-yellow-600',
    trend: 'Leads générés (Email)',
    trendPositive: false,
  },
  {
    label: 'Vues du Blog (SEO)',
    value: '8,590',
    icon: Eye,
    iconBg: 'bg-teal-50',
    iconText: 'text-teal-600',
    trend: '+24% trafic organique',
    trendPositive: true,
  },
];

// Trafic par pays (Top 5).
export const traffic = [
  { flag: '🇨🇮', country: "Côte d'Ivoire", percent: 78, bar: 'bg-ziv-cyan' },
  { flag: '🇸🇳', country: 'Sénégal', percent: 8, bar: 'bg-blue-400' },
  { flag: '🇲🇱', country: 'Mali', percent: 6, bar: 'bg-blue-300' },
  { flag: '🇧🇫', country: 'Burkina Faso', percent: 5, bar: 'bg-gray-400' },
  { flag: '🌍', country: 'Reste du monde', percent: 3, bar: 'bg-gray-300' },
];
