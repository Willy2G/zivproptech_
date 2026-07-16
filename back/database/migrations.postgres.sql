-- Fichier de migrations sécurisées
-- Ajoutez ici vos requêtes ALTER TABLE ou CREATE TABLE IF NOT EXISTS.
-- Ce fichier est exécuté par la route /api/setup/migrate sans effacer les données existantes.

-- Exemple : Ajout de la colonne calendly_url si elle n'existe pas
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS calendly_url VARCHAR(255) DEFAULT 'https://calendly.com/alertefoncier';

-- Vous pouvez ajouter de nouvelles tables ici de cette façon :
-- CREATE TABLE IF NOT EXISTS new_feature_table (
--    id SERIAL PRIMARY KEY,
--    name VARCHAR(100)
-- );
