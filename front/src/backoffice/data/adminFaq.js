// FAQ editable dans la vue "FAQ & Chatbot".
export const adminFaqs = [
  {
    id: 1,
    question: 'Vos logiciels sont-ils conformes OHADA ?',
    answer:
      "Absolument. Notre module comptable respecte le plan comptable SYSCOHADA révisé, idéal pour l'UEMOA.",
  },
  {
    id: 2,
    question: 'Proposez-vous une formation ?',
    answer:
      "Oui, tout déploiement s'accompagne de sessions de formation pratiques pour vos équipes.",
  },
];

// Valeurs par defaut de la configuration du chatbot.
export const chatbotConfig = {
  enabled: true,
  bubbleMessage: "Besoin d'aide ? Laissez-moi vous guider vers le bon logiciel.",
  firstMessage:
    'Bonjour ! 👋 Bienvenue sur ZIV PROPTECH. Pour vous guider précisément, quelle est votre activité principale ?',
};
