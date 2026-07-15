// Scenario du chatbot guide. Chaque etape a un message et des options.
// Une option porte soit `next` (etape suivante), soit `action` (ouverture modale).
export const chatFlows = {
  start: {
    msg: 'Bonjour ! 👋 Bienvenue sur ZIV PROPTECH. Pour vous guider précisément, quelle est votre activité principale ?',
    options: [
      { text: '🏢 Promotion Immobilière', next: 'promo' },
      { text: '🤝 Agence / Gestion', next: 'agence' },
      { text: '🗺️ Aménagement Foncier', next: 'foncier' },
      { text: '🏙️ Syndic de Copropriété', next: 'syndic' },
      { text: '⚖️ Notaire / Juridique', next: 'juridique' },
    ],
  },
  promo: {
    msg: 'Parfait. Pour la promotion, notre **ERP** gère tout (Compta, Chantiers), et notre module **LOTIGES CRM** booste vos ventes VEFA.',
    options: [
      { text: 'Découvrir LOTIGES ERP', action: 'open_modal', target: 'erp' },
      { text: 'Voir le module VEFA (LOTIGES)', action: 'open_modal', target: 'lotiges' },
      { text: '📞 Prendre RDV avec un expert', action: 'open_expert' },
      { text: '⬅️ Retour', next: 'start' },
    ],
  },
  agence: {
    msg: 'Excellent. Pour une agence, nous avons **EASY VENTE** (transactions) et **GESPAT** (automatisation de la gestion locative).',
    options: [
      { text: 'Voir EASY VENTE', action: 'open_modal', target: 'vente' },
      { text: 'Voir GESPAT (Location)', action: 'open_modal', target: 'gespat' },
      { text: '⬅️ Retour', next: 'start' },
    ],
  },
  foncier: {
    msg: "L'aménagement foncier exige de la rigueur. **SUIT FONCIER** est idéal pour suivre vos ACD et vos recouvrements terrains.",
    options: [
      { text: 'Découvrir SUIT FONCIER', action: 'open_modal', target: 'foncier' },
      { text: '⬅️ Retour', next: 'start' },
    ],
  },
  syndic: {
    msg: 'Pour les professionnels et bénévoles, **SYNDYCARRE** est la plateforme intégrale qui gère vos appels de fonds, la comptabilité et la cartographie SIG de vos résidences.',
    options: [
      { text: 'Découvrir SYNDYCARRE', action: 'open_modal', target: 'syndycarre' },
      { text: '⬅️ Retour', next: 'start' },
    ],
  },
  juridique: {
    msg: 'La conformité est clé. Notre module **GEDAJ** gère votre conformité LBC et l\'archivage numérique de vos actes.',
    options: [
      { text: 'Découvrir GEDAJ', action: 'open_modal', target: 'gedaj' },
      { text: '⬅️ Retour', next: 'start' },
    ],
  },
};
