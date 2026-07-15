# ZIV PROPTECH — Back (Express + MySQL)

API qui reçoit les demandes de devis/démo du site vitrine et les enregistre dans
la table `leads` (voir `database/schema.sql`).

## Démarrage

```bash
cd back
npm install
cp .env.example .env        # puis renseignez vos identifiants MySQL
npm run dev                 # http://localhost:4000  (node --watch)
# ou : npm start
```

Le serveur démarre même si MySQL est injoignable (un avertissement est loggé) ;
les écritures échoueront tant que la base n'est pas configurée.

## Base de données

Deux versions du schéma sont fournies (mêmes tables et données) :

```bash
# MySQL / MariaDB
mysql -u root -p < database/schema.sql

# PostgreSQL 14+  (créez d'abord la base)
createdb ziv_proptech
psql -d ziv_proptech -f database/schema.postgres.sql
```

> La version PostgreSQL utilise des types `ENUM` natifs, des colonnes `UUID`
> (`gen_random_uuid()`), du `JSONB`, `TIMESTAMPTZ` et un trigger `set_updated_at()`
> à la place de `ON UPDATE CURRENT_TIMESTAMP`.
>
> ⚠️ Le code actuel (`src/config/db.js`, contrôleurs) utilise le driver **mysql2**.
> Pour tourner sur PostgreSQL, il faut remplacer `mysql2` par **pg** et adapter les
> requêtes (placeholders `$1, $2…` au lieu de `?`, `result.rows` / `result.rowCount`).
> Je peux le faire sur demande.

Le schéma provient du script fourni initialement. Table clé pour ce backend :

| Colonne                 | Type                               |
| ----------------------- | ---------------------------------- |
| id                      | VARCHAR(36) (UUID)                 |
| full_name               | VARCHAR(100)                       |
| phone                   | VARCHAR(20)                        |
| email                   | VARCHAR(100)                       |
| software_interest       | VARCHAR(50)                        |
| consulting_type         | VARCHAR(50) NULL                   |
| message                 | TEXT NULL                          |
| status                  | ENUM('new','in_progress','closed') |
| created_at / updated_at | TIMESTAMP                          |

## Endpoints

| Méthode | Route            | Description                                   |
| ------- | ---------------- | --------------------------------------------- |
| GET     | `/api/health`    | Vérifie que l'API répond                      |
| POST    | `/api/leads`     | Crée une demande (site public — validation)   |
| GET     | `/api/leads`     | Liste les demandes (back-office — à protéger) |
| PATCH   | `/api/leads/:id` | Met à jour le statut d'un lead (back-office)  |
| DELETE  | `/api/leads/:id` | Supprime un lead (back-office)                |

Exemple de payload `POST /api/leads` :

```json
{
  "full_name": "Agence Kouassi Immo",
  "phone": "+225 07 00 00 00 00",
  "email": "contact@kouassi-immo.ci",
  "software_interest": "lotiges"
}
```

## Structure

```
back/
├── server.js               # app Express + middlewares + démarrage
├── .env.example
├── database/
│   └── schema.sql          # création complète de la base ziv_proptech
└── src/
    ├── config/db.js        # pool de connexions MySQL
    ├── routes/leads.js
    └── controllers/leadsController.js
```

## À faire ensuite (pistes)

- Authentification du back-office (le CRM `front /admin` consomme déjà `/api/leads`).
- Endpoints d'écriture pour les autres contenus gérés dans le back-office
  (softwares, blog_posts, testimonials, faqs, global_settings).
- Endpoints publics de lecture pour alimenter le site depuis la base au lieu des
  fichiers `front/src/data/`.
- Rate-limiting sur `POST /api/leads`.
