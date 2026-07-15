// Donnees de secours affichees dans le CRM si l'API backend est injoignable.
// En fonctionnement normal, le CRM charge les leads via GET /api/leads.
export const mockLeads = [
  {
    id: 'mock-1',
    full_name: 'Jean Kouassi',
    company: 'SCI Bâtisseur',
    phone: '07 08 53 11 11',
    email: 'jean@scibatisseur.ci',
    software_interest: 'lotiges_erp',
    status: 'new',
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    full_name: 'Aminata Sylla',
    company: 'Agence Immo Plus',
    phone: '01 02 03 04 05',
    email: 'aminata@immoplus.ci',
    software_interest: 'gespat',
    status: 'closed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Libelles et styles des statuts de lead (alignes sur l'ENUM MySQL).
export const leadStatuses = {
  new: { label: 'À contacter', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  in_progress: { label: 'En cours', badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  closed: { label: 'Traité / Clos', badge: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
};
