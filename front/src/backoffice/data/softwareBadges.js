// Couleurs de badge par logiciel (valeur `software_interest` -> libelle + classes).
export const softwareBadges = {
  lotiges_erp: { label: 'LOTIGES ERP', className: 'bg-blue-50 text-blue-700' },
  lotiges: { label: 'LOTIGES', className: 'bg-blue-50 text-blue-700' },
  suit_foncier: { label: 'SUIT FONCIER', className: 'bg-teal-50 text-teal-700' },
  easy_vente: { label: 'EASY VENTE', className: 'bg-indigo-50 text-indigo-700' },
  gespat: { label: 'GESPAT', className: 'bg-orange-50 text-orange-700' },
  gedaj: { label: 'GEDAJ', className: 'bg-red-50 text-red-700' },
  syndycarre: { label: 'SYNDYCARRE', className: 'bg-emerald-50 text-emerald-700' },
  multiple: { label: 'ÉCOSYSTÈME', className: 'bg-gray-100 text-gray-700' },
  'Rendez-vous': { label: 'RENDEZ-VOUS', className: 'bg-fuchsia-50 text-fuchsia-700' },
};

export function getSoftwareBadge(value) {
  return softwareBadges[value] || { label: value || '—', className: 'bg-gray-100 text-gray-700' };
}
