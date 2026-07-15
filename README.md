# ZIV PROPTECH

Suite logicielle immobilière (Côte d'Ivoire / Afrique de l'Ouest), éditée par
Alerte Foncier. Ce dépôt est organisé en deux applications indépendantes :

```
zivtech/
├── front/   → App React (Vite + Tailwind) : site vitrine "/" + back office "/admin"
└── back/    → API Express + MySQL (gestion des leads / devis)
```

Le **back office** d'administration n'est pas un projet séparé : c'est l'espace
`/admin` de l'app `front/` (mêmes dépendances, un seul `npm install`). Voir
[`front/src/backoffice/`](front/src/backoffice/).

## Démarrage rapide

Ouvrez deux terminaux.

```bash
# Terminal 1 — API
cd back
npm install
cp .env.example .env      # renseignez MySQL
npm run dev               # http://localhost:4000

# Terminal 2 — Site + Back office
cd front
npm install
npm run dev               # site public : http://localhost:5173
                          # back office : http://localhost:5173/admin
```

Le front proxifie automatiquement `/api/*` vers le back (voir `front/vite.config.js`).

## Documentation détaillée

- [`front/README.md`](front/README.md) — architecture des composants React.
- [`back/README.md`](back/README.md) — endpoints, base de données, schéma SQL.

## Fichiers d'origine (référence)

- `ziv_proptech ok.html` — maquette HTML monolithique d'origine (convertie dans `front/`).
- `back_office_ziv_proptech.html` — maquette du back-office admin (à intégrer ultérieurement).
- `script_de_cr_ation_bdd_ziv_proptech_complet.sql` — script SQL (copié dans `back/database/schema.sql`).
- `Cahier des Charges et Déploiement.md` — spécifications.
