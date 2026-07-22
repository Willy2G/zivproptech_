-- Fichier de migrations sécurisées
-- Ajoutez ici vos requêtes ALTER TABLE ou CREATE TABLE IF NOT EXISTS.
-- Ce fichier est exécuté par la route /api/setup/migrate sans effacer les données existantes.

-- Exemple : Ajout de la colonne calendly_url si elle n'existe pas
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS calendly_url VARCHAR(255) DEFAULT 'https://calendly.com/alertefoncier';

ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS demo_video_url VARCHAR(255);
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS guide_document_url VARCHAR(255);
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS guide_email_subject VARCHAR(255);
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS guide_email_content TEXT;
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS email_from_address VARCHAR(255) DEFAULT 'noreply@immosuit.com';
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS email_from_name VARCHAR(255) DEFAULT 'IMMOSUIT';
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255);
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS smtp_port INT;
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS smtp_user VARCHAR(255);
ALTER TABLE global_settings ADD COLUMN IF NOT EXISTS smtp_pass VARCHAR(255);

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Nettoyage des données fictives de visites (383 visites)
-- DELETE FROM visitor_stats;

-- Vous pouvez ajouter de nouvelles tables ici de cette façon :
-- CREATE TABLE IF NOT EXISTS new_feature_table (
--    id SERIAL PRIMARY KEY,
--    name VARCHAR(100)
-- );

DO $$ BEGIN
    ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'completed';
    ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'postponed';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
