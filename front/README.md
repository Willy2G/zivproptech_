# ZIV PROPTECH — Front (React + Vite + Tailwind)

Application React unique qui contient **deux espaces** partageant les mêmes
dépendances (un seul `npm install`) :

| Route      | Espace                          |
|------------|---------------------------------|
| `/`        | Site vitrine public             |
| `/admin`   | Back office d'administration    |

Le routage est géré par **react-router-dom** ([App.jsx](src/App.jsx)).

## Démarrage

```bash
cd front
npm install
npm run dev      # site public : http://localhost:5173
                 # back office  : http://localhost:5173/admin
```

Autres scripts :

```bash
npm run build    # build de production dans dist/
npm run preview  # prévisualise le build
```

> Le formulaire de contact (public) et le CRM (admin) appellent l'API via `/api`,
> proxifiée vers le backend Express (`../back`, port 4000) grâce à `vite.config.js`.
> Variable optionnelle : `VITE_API_URL` pour cibler une autre API.

## Structure

```
src/
├── main.jsx                # point d'entrée : monte <App/> dans <BrowserRouter>
├── App.jsx                 # routeur : "/" -> PublicSite, "/admin/*" -> AdminApp
├── index.css               # Tailwind + styles custom (hero-pattern, glass, carrousel…)
│
├── pages/
│   └── PublicSite.jsx      # site vitrine (sections + modales + widgets, sous ModalProvider)
│
├── context/
│   └── ModalContext.jsx    # état global des modales + sélection logiciel
│
├── services/
│   └── api.js              # couche d'accès à l'API backend
│
├── data/                   # contenus (aucun JSX) — faciles à éditer / brancher sur une API
│   ├── modules.js          # cartes de la section Solutions
│   ├── softwareData.js     # détails affichés dans la modale logiciel
│   ├── pricing.js          # grille tarifaire
│   ├── testimonials.js     # témoignages du carrousel
│   ├── blogData.js         # articles + liste des cartes blog
│   ├── legalData.js        # pages Confidentialité / CGV-CGU
│   ├── faq.js              # questions fréquentes
│   └── chatFlows.js        # scénario du chatbot
│
└── components/
    ├── ui/                 # briques réutilisables
    │   ├── Icon.jsx        # icône lucide dynamique par nom
    │   └── Logo.jsx
    ├── layout/
    │   ├── Navbar.jsx
    │   └── Footer.jsx
    ├── sections/           # une section = un composant
    │   ├── Hero.jsx
    │   ├── StatsBar.jsx
    │   ├── TargetAudience.jsx
    │   ├── Solutions.jsx   (+ ModuleCard.jsx)
    │   ├── About.jsx
    │   ├── Testimonials.jsx
    │   ├── Resources.jsx
    │   ├── Faq.jsx
    │   ├── Pricing.jsx
    │   └── Contact.jsx
    ├── modals/
    │   ├── Modal.jsx        # modale de base (animation + backdrop)
    │   ├── SoftwareModal.jsx
    │   ├── BlogModal.jsx
    │   ├── LegalModal.jsx
    │   └── ExpertModal.jsx  # widget Calendly
    └── widgets/
        ├── WhatsAppButton.jsx
        └── Chatbot.jsx      # assistant guidé
```

### Back office (`src/backoffice/`)

Espace d'administration monté sous `/admin`, isolé dans son propre dossier mais
dans le **même projet** (aucune install supplémentaire).

```
src/backoffice/
├── AdminApp.jsx            # ToastProvider + routes admin (sous AdminLayout)
├── context/
│   └── ToastContext.jsx    # notifications "toast"
├── data/                   # contenus & mocks (navigation, KPIs, catalogue, articles…)
├── components/
│   ├── ui/                 # StatCard, SoftwareBadge, Toggle, Toast, FormControls, AdminLogo
│   └── layout/             # AdminLayout (sidebar + header + <Outlet/>), Sidebar, Header
└── views/                  # une vue = une page admin
    ├── Dashboard.jsx       # KPIs, derniers leads, trafic pays
    ├── Crm.jsx             # leads en direct via l'API (statut + suppression)
    ├── Logiciels.jsx       # édition du catalogue & tarifs
    ├── Blog.jsx            # gestion des articles + éditeur CMS
    ├── Testimonials.jsx    # gestion des témoignages
    ├── Faq.jsx             # config chatbot + FAQ
    └── Seo.jsx             # SEO, tracking, charte graphique, coordonnées
```

Le CRM est **connecté au backend** : il liste les leads (`GET /api/leads`), met à
jour leur statut (`PATCH`) et les supprime (`DELETE`). Si l'API est injoignable,
il bascule sur des données de démonstration (bannière d'avertissement). Les
autres vues fonctionnent avec des données locales + retour visuel (toast) : elles
sont prêtes à être branchées quand les endpoints d'écriture seront exposés.

## Choix techniques

- **Icônes** : `lucide-react` (les icônes `<i data-lucide>` de la maquette sont
  remplacées par des composants React ; un helper `Icon` permet d'en piloter
  depuis les fichiers `data/`).
- **Modales** : centralisées dans `ModalContext` pour qu'un bouton (carte, footer,
  chatbot…) puisse ouvrir n'importe quelle modale sans prop drilling.
- **Contenus** : isolés dans `data/` pour séparer le fond de la forme et faciliter
  une future migration vers l'API / le back-office.
