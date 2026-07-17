-- ==============================================================================
-- ZIV PROPTECH - Script BDD Complet (Structure + Données Initiales + Index)
-- Version PostgreSQL (14+)  --  équivalent de schema.sql (MySQL/MariaDB)
-- ==============================================================================
--
-- PostgreSQL ne permet pas "CREATE DATABASE IF NOT EXISTS" ni "USE" dans un
-- script. Créez d'abord la base puis connectez-vous dessus :
--
--   createdb ziv_proptech            (ou : CREATE DATABASE ziv_proptech;)
--   psql -d ziv_proptech -f schema.postgres.sql
--
-- ==============================================================================

-- gen_random_uuid() est natif depuis PG13 ; pgcrypto le fournit pour les versions
-- antérieures. On l'active par sécurité.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------------------------
-- Types ENUM (idempotents : ignorés s'ils existent déjà)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS admins, leads, softwares, blog_posts, testimonials, faqs, pages, site_sections, visitor_stats, chatbot_flows, global_settings CASCADE;

DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('super_admin', 'editor', 'sales');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('new', 'in_progress', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('online', 'offline');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------------------------
-- Fonction trigger pour maintenir updated_at (remplace "ON UPDATE CURRENT_TIMESTAMP")
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. TABLE : admins (Sécurité et accès Back Office)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role admin_role DEFAULT 'editor',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_admins_updated ON admins;
CREATE TRIGGER trg_admins_updated BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 2. TABLE : leads (CRM - Demandes de devis et démos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    software_interest VARCHAR(50) NOT NULL,
    consulting_type VARCHAR(50) DEFAULT NULL,
    message TEXT,
    status lead_status DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_leads_updated ON leads;
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index pour accélérer le tri dans le CRM (Admin)
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_date ON leads(created_at);

-- ==============================================================================
-- 3. TABLE : softwares (Catalogue des logiciels et tarifs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS softwares (
    id VARCHAR(50) PRIMARY KEY,          -- Ex: 'lotiges', 'lotiges_erp', 'gespat'
    name VARCHAR(100) NOT NULL,
    subtitle VARCHAR(200),
    description TEXT,
    price_cfa INTEGER NOT NULL DEFAULT 0, -- 0 = Sur Devis
    youtube_id VARCHAR(50),
    cover_image VARCHAR(255),
    icon_name VARCHAR(50),               -- Nom de l'icône Lucide (ex: 'building-2')
    features JSONB,
    benefits JSONB,
    is_popular BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_softwares_updated ON softwares;
CREATE TRIGGER trg_softwares_updated BEFORE UPDATE ON softwares
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 4. TABLE : blog_posts (Articles SEO & Livres Blancs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    cover_image VARCHAR(255),
    content_html TEXT NOT NULL,
    meta_description VARCHAR(160),
    read_time_minutes INTEGER DEFAULT 5,
    views_count INTEGER DEFAULT 0,
    status post_status DEFAULT 'draft',
    admin_id UUID,
    sort_order INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT fk_blog_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS trg_blog_updated ON blog_posts;
CREATE TRIGGER trg_blog_updated BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index pour la recherche SEO par URL
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);

-- ==============================================================================
-- 5. TABLE : testimonials (Preuve Sociale B2B)
-- ==============================================================================
DROP TABLE IF EXISTS testimonials CASCADE;
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(100) NOT NULL,
    company_role VARCHAR(100) NOT NULL,
    client_initials VARCHAR(5) NOT NULL,
    company_name VARCHAR(100),
    quote TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
    status content_status DEFAULT 'online',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (client_name, sort_order)
);

-- ==============================================================================
-- 6. TABLE : faqs (Base de connaissances)
-- ==============================================================================
DROP TABLE IF EXISTS faqs CASCADE;
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    status content_status DEFAULT 'online',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (question, sort_order)
);

-- ==============================================================================
-- 6.1. TABLE : pages (Pages légales : CGU, Confidentialité, Mentions légales)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pages (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    meta_description VARCHAR(255),
    content_html TEXT NOT NULL,
    last_updated_by UUID,
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_pages_updated ON pages;
CREATE TRIGGER trg_pages_updated BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 6.2. TABLE : site_sections (Contenu dynamique modifiable : Textes, Titres)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS site_sections (
    section_key VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    subtitle VARCHAR(255),
    content_text TEXT,
    button_text VARCHAR(100),
    image_url VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_sections_updated ON site_sections;
CREATE TRIGGER trg_sections_updated BEFORE UPDATE ON site_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 6.3. TABLE : visitor_stats (Statistiques de trafic analytique interne)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS visitor_stats (
    id SERIAL PRIMARY KEY,
    visit_date DATE NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    country_name VARCHAR(50),
    unique_visitors INTEGER DEFAULT 1,
    page_views INTEGER DEFAULT 1,
    UNIQUE (visit_date, country_code)
);

-- ==============================================================================
-- 6.4. TABLE : chatbot_flows (Configuration interactive de l'arbre du chatbot)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS chatbot_flows (
    step_key VARCHAR(50) PRIMARY KEY,
    message_text TEXT NOT NULL,
    options_json JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_chatbot_updated ON chatbot_flows;
CREATE TRIGGER trg_chatbot_updated BEFORE UPDATE ON chatbot_flows
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 7. TABLE : global_settings (Configuration unique du site et charte graphique)
-- ==============================================================================
DROP TABLE IF EXISTS global_settings CASCADE;
CREATE TABLE IF NOT EXISTS global_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    seo_title VARCHAR(255) DEFAULT 'ZIV PROPTECH | Logiciels Immobiliers',
    seo_meta_desc VARCHAR(160),
    seo_keywords VARCHAR(255),
    seo_og_image VARCHAR(255),
    google_analytics_id VARCHAR(50),
    facebook_pixel_id VARCHAR(50),
    chatbot_is_active BOOLEAN DEFAULT TRUE,
    chatbot_tooltip_msg VARCHAR(255) DEFAULT 'Besoin d''aide ? Laissez-moi vous guider...',
    chatbot_welcome_msg TEXT,
    primary_color VARCHAR(10) DEFAULT '#00A8B5',
    secondary_color VARCHAR(10) DEFAULT '#0A1E4A',
    logo_url VARCHAR(255) DEFAULT 'logo_ziv.png',
    favicon_url VARCHAR(255) DEFAULT 'favicon.ico',
    contact_phones VARCHAR(100) DEFAULT '(+225) 27 22 43 51 88 / 07 08 53 11 11',
    contact_email VARCHAR(100) DEFAULT 'info@alertefoncier.ci',
    contact_address VARCHAR(255) DEFAULT 'Abidjan, Cité SYNATRESOR en face de la Pharmacie Jules Verne',
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255),
    instagram_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    youtube_url VARCHAR(255),
    maintenance_mode BOOLEAN DEFAULT FALSE,
    sms_api_url VARCHAR(255),
    sms_api_key VARCHAR(255),
    sms_api_token VARCHAR(255),
    sms_sender_id VARCHAR(50),
    calendly_url VARCHAR(255) DEFAULT 'https://calendly.com/alertefoncier',
    demo_video_url VARCHAR(255),
    guide_document_url VARCHAR(255),
    guide_email_subject VARCHAR(255),
    guide_email_content TEXT,
    email_from_address VARCHAR(255) DEFAULT 'noreply@immosuit.com',
    email_from_name VARCHAR(255) DEFAULT 'IMMOSUIT',
    smtp_host VARCHAR(255),
    smtp_port INT,
    smtp_user VARCHAR(255),
    smtp_pass VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT chk_single_row CHECK (id = 1)
);

DROP TRIGGER IF EXISTS trg_settings_updated ON global_settings;
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON global_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- PEUPLEMENT DE LA BASE (SEEDING) - Démarrage direct du site
-- ==============================================================================

-- 7.1. Global Settings
INSERT INTO global_settings (id, seo_title, seo_meta_desc, seo_keywords, chatbot_welcome_msg, facebook_url, linkedin_url, youtube_url, maintenance_mode)
VALUES (
    1,
    'ZIV PROPTECH | Logiciels Immobiliers en Côte d''Ivoire et Afrique de l''Ouest',
    'Découvrez ZIV PROPTECH, la suite de logiciels immobiliers de référence. Générez des leads qualifiés, gérez vos projets, vos ventes et vos loyers.',
    'logiciels immobiliers, Côte d''Ivoire, Afrique de l''Ouest, proptech, gestion locative, promotion immobilière, syndic',
    'Bonjour ! 👋 Bienvenue sur ZIV PROPTECH. Pour vous guider précisément, quelle est votre activité principale ?',
    'https://facebook.com/alertefoncier',
    'https://linkedin.com/company/alerte-foncier',
    'https://youtube.com/@alertefoncier',
    FALSE
)
ON CONFLICT (id) DO NOTHING;

-- 7.2. Compte Admin par défaut (Mot de passe: "AdminZiv2026!")
INSERT INTO admins (id, full_name, email, password_hash, role)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Super Admin ZIV',
    'admin@zivproptech.ci',
    '$2b$10$R2XqR4TRLBoxYIZLnj4YyOGs9Bxz5nUS2GXUuBBsi/wankskjXpgi',
    'super_admin'
)
ON CONFLICT (email) DO NOTHING;

-- 7.3. Catalogue des Logiciels (ZIV Suite)
INSERT INTO softwares (id, name, subtitle, description, price_cfa, youtube_id, cover_image, icon_name, is_popular, sort_order, features, benefits)
VALUES
(
    'lotiges', 'LOTIGES CRM', 'Le Moteur Commercial de la Promotion Immobilière',
    'La référence CRM conçue spécifiquement pour les promoteurs ouest-africains. Simplifiez radicalement la gestion de vos Ventes en l''État Futur d''Achèvement (VEFA).',
    75000, 'M7lc1UVf-VE', 'https://images.unsplash.com/photo-1556761175-5973dc0f32b7', 'building-2', TRUE, 1,
    '["Suivi détaillé de l''échéancier client (VEFA)", "Génération automatisée des contrats de réservation", "Pipeline commercial et qualification des leads", "Tableau de bord de rentabilité par programme"]',
    '["Zéro papier : centralisation des dossiers clients", "Accélération du cycle de vente", "Visibilité de trésorerie en temps réel", "Fidélisation client"]'
),
(
    'lotiges_erp', 'LOTIGES ERP', 'La Gouvernance Totale de votre Holding Immobilière',
    'Oubliez les silos Excel. Ce progiciel de gestion intégré à 360 degrés interconnecte vos finances, vos chantiers, vos ressources humaines et vos ventes.',
    0, 'M7lc1UVf-VE', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', 'layers', FALSE, 2,
    '["Comptabilité Générale et Analytique (Norme OHADA)", "Pilotage de l''exécution des chantiers (Suivi budget BTP)", "Gestion des Ressources Humaines & Paie", "Contrôle des décaissements et factures fournisseurs"]',
    '["Pilotage ultra-précis des marges de construction", "Gain de temps colossal sur la clôture comptable OHADA", "Traçabilité infaillible des flux financiers", "Hébergement souverain"]'
),
(
    'suit_foncier', 'SUIT FONCIER', 'Sécurisez l''Aménagement Foncier & le Lotissement',
    'L''outil métier numéro 1 des aménageurs agréés. Cartographiez vos opérations et pilotez l''obtention des ACD sans perdre le fil.',
    30000, 'M7lc1UVf-VE', 'https://images.unsplash.com/photo-1524813686514-a57563d77965', 'map', FALSE, 3,
    '["Suivi pas-à-pas de la procédure d''ACD", "Inventaire dynamique des lots", "Gestion pointue des paiements terrains échelonnés", "Génération de lettres d''attribution"]',
    '["Éradication définitive des doubles ventes", "Anticipation des blocages administratifs", "Gestion de trésorerie fiabilisée", "Gage de sérieux absolu"]'
),
(
    'easy_vente', 'EASY VENTE', 'Le Moteur Turbo de vos Transactions Immobilières',
    'Développé pour les agences réseau et les courtiers. EASY VENTE croise intelligemment votre portefeuille de biens avec les requêtes de vos prospects.',
    40000, 'M7lc1UVf-VE', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa', 'home', FALSE, 4,
    '["Algorithme de rapprochement intelligent Offre / Demande", "Gestion multimédia du portefeuille de biens", "Suivi chronologique des visites", "Registre dématérialisé central"]',
    '["Hausse immédiate du taux de conversion", "Réactivité redoutable face aux requêtes", "Édition rapide de reportings pros", "Motivation des commerciaux"]'
),
(
    'gespat', 'GESPAT', 'L''Automatisation Intelligente de la Gestion Locative',
    'Syndics et Agences de gestion : GESPAT automatise le cauchemar des appels de loyers, des quittances et des redditions de comptes propriétaires.',
    15800, 'M7lc1UVf-VE', 'https://images.unsplash.com/photo-1554469384-e58fac16e23a', 'wallet', FALSE, 5,
    '["Génération/Envoi auto des quittances et appels de loyer", "Tableau de bord flash de suivi des impayés", "Calcul automatisé des honoraires de gestion", "Reddition de comptes propriétaires"]',
    '["Division par 4 du temps administratif mensuel", "Chute drastique des loyers impayés", "Transparence financière rassurante", "Valorisation de l''image de marque"]'
),
(
    'gedaj', 'GEDAJ', 'La Muraille de Sécurité Juridique & Conformité LBC',
    'Le module de Gestion Électronique des Documents intégrant nativement la réglementation sur la Lutte contre le Blanchiment de Capitaux (LBC).',
    12000, 'M7lc1UVf-VE', 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85', 'shield-check', FALSE, 6,
    '["Formulaires KYC et audit d''identité LBC/FT intégrés", "Coffre-fort numérique crypté des actes notariés", "Système de signature électronique à valeur légale", "Alertes automatiques"]',
    '["Zéro risque d''amende pour non-conformité LBC", "Protection juridique absolue pour le dirigeant", "Économie massive d''espace physique", "Retrieval instantané des pièces"]'
),
(
    'syndycarre', 'SYNDYCARRE', 'Plateforme pour la Gestion de Copropriété Augmentée',
    'Syndics professionnels et bénévoles : Syndycarre centralise la comptabilité, automatise les recouvrements, cartographie vos cités (SIG) et digitalise vos AG.',
    22800, '', 'Syndycarre.jpeg', 'users', FALSE, 7,
    '["Génération/Envoi auto des appels de fonds par tantièmes", "Cartographie SIG & module GMAO", "Paiement Mobile Money intégré", "Assemblées Générales (Vote en direct & PV)"]',
    '["Chute drastique des impayés grâce au Mobile Money", "Division par 5 du temps administratif", "Maîtrise totale des infrastructures", "Image de marque premium"]'
)
ON CONFLICT (id) DO NOTHING;

-- 7.4. Témoignages (Preuve sociale)
INSERT INTO testimonials (client_name, company_role, client_initials, company_name, quote, sort_order) VALUES
('M. Sidibé Souleymane', 'Gérant (Abidjan)', 'SS', 'ORIBAT', 'Le déploiement du logiciel LOTI''GES au sein d''ORIBAT s''est parfaitement déroulé. Après une excellente formation de nos agents, la prise en main de cet outil innovant a été immédiate. C''est un véritable levier de performance.', 1),
('Mme Koumba Wagué', 'Directrice Générale', 'KW', 'KOUMBA PRESTIGE CONSTRUCTION', 'En tant que promoteur immobilier agréé, nous recherchions une solution rigoureuse pour structurer nos activités. Alerte Foncier a parfaitement répondu à nos attentes avec LOTI''GES. Le déploiement a été mené de main de maître.', 2),
('M. Patrick Sebatigita', 'Directeur Général', 'PS', 'INTERBAT', 'L''intégration du logiciel LOTI''GES par Alerte Foncier au sein de notre structure a été d''une grande efficacité. Grâce à un accompagnement de qualité et à la formation sur-mesure, le logiciel est aujourd''hui parfaitement opérationnel.', 3),
('M. Issouf Touré', 'Directeur Général', 'IT', 'SOGETD', 'Pour piloter nos activités d''aménageur foncier et de promoteur agréé à San-Pedro, le choix de LOTI''GES s''est avéré excellent. Le cabinet Alerte Foncier a assuré un déploiement impeccable.', 4),
('Mme Ouattara P. H.', 'Directrice Générale', 'OP', 'SCBAU', 'Le cabinet Alerte Foncier nous apporte une réelle valeur ajoutée avec ses outils innovants. Le déploiement de LOTI''GES nous permet aujourd''hui d''optimiser et de sécuriser la gestion de nos projets de construction.', 5),
('M. Kouadio Raphael Ebouo', 'Gérant', 'KR', 'ELITE FONCIER & TOPOGRAPHIQUE', 'L''équipe d''Alerte Foncier a déployé avec succès son logiciel de gestion LOTIGES dans notre structure. Grâce à une formation rigoureuse, nos équipes maîtrisent parfaitement cet outil innovant.', 6)
ON CONFLICT (client_name, sort_order) DO NOTHING;

-- 7.5. FAQ
INSERT INTO faqs (question, answer, sort_order) VALUES
('Vos logiciels sont-ils conformes à la réglementation OHADA et ivoirienne ?', 'Absolument. Contrairement aux logiciels européens, ZIV PROPTECH a été conçu nativement pour l''espace UEMOA. Notre module comptable respecte le plan comptable SYSCOHADA révisé. De plus, nos modules prennent en charge les spécificités locales comme le traitement des ACD et la réglementation LBC/FT.', 1),
('Faut-il installer l''ERP sur nos serveurs ou est-ce dans le Cloud ?', 'Nous offrons les deux ! Pour une flexibilité maximale, nos modules spécialisés sont disponibles en mode SaaS (Cloud sécurisé) avec des sauvegardes quotidiennes. Pour les grandes holdings nécessitant LOTIGES ERP, nous proposons également une Licence On-Premise pour une installation sur vos propres serveurs.', 2),
('Est-il possible d''intégrer ZIV avec nos moyens de paiement (Mobile Money, Banques) ?', 'Oui. L''architecture de ZIV dispose d''API ouvertes. Nous pouvons intégrer des passerelles de paiement locales (Orange Money, MTN, Moov, Wave) pour l''encaissement automatique des loyers via GESPAT ou SYNDYCARRE.', 3),
('Proposez-vous un accompagnement et une formation de notre personnel ?', 'La digitalisation est avant tout humaine. Tout déploiement de ZIV s''accompagne d''un audit de vos processus actuels. Nos experts assurent ensuite la configuration du logiciel et organisent des sessions de formation pratiques pour vos équipes.', 4)
ON CONFLICT (question, sort_order) DO NOTHING;

-- 7.6. Blog Posts (SEO Content)
INSERT INTO blog_posts (title, slug, category, meta_description, status, published_at, content_html) VALUES
('Lutte contre le Blanchiment de Capitaux (LBC) : Comment les agences doivent s''adapter en 2026 ?', 'conformite-lbc-agences-2026', 'Réglementation', 'Découvrez les nouvelles exigences documentaires LBC/FT pour les transactions immobilières en Côte d''Ivoire et comment le logiciel GEDAJ vous protège.', 'published', now(), '<p>Le secteur de l''immobilier en Côte d''Ivoire et dans l''espace UEMOA est de plus en plus encadré...</p>'),
('VEFA en Côte d''Ivoire : Les 3 erreurs fatales dans la gestion des échéanciers clients', 'vefa-erreurs-gestion-echeanciers', 'Promotion', 'Gérer des appels de fonds sur Excel est risqué. Voici comment sécuriser votre trésorerie et la confiance de vos acquéreurs en VEFA.', 'published', now(), '<p>La Vente en l''État Futur d''Achèvement (VEFA) est le modèle de développement roi...</p>'),
('Comment obtenir un ACD en Côte d''Ivoire : Étapes et coûts (Guide 2026)', 'obtenir-acd-cote-d-ivoire-etapes', 'Lotissement', 'L''Arrêté de Concession Définitive est le sésame foncier. Voici la procédure détaillée et comment le logiciel SUIT FONCIER automatise son suivi.', 'published', now(), '<p>L''Arrêté de Concession Définitive (ACD) est le seul document qui confère la pleine propriété...</p>'),
('Calculer les tantièmes de copropriété : La méthode infaillible', 'calcul-tantiemes-copropriete-methode', 'Syndic', 'Évitez les conflits entre résidents. Apprenez à répartir les charges de copropriété de manière équitable grâce à SYNDYCARRE.', 'published', now(), '<p>La répartition des charges au sein d''une copropriété est la principale source de litiges...</p>')
ON CONFLICT (slug) DO NOTHING;

-- 7.7. Leads (Données de test pour le Tableau de Bord Admin)
INSERT INTO leads (full_name, phone, email, software_interest, status, created_at) VALUES
('Jean Kouassi (SCI Bâtisseur)', '07 08 53 11 11', 'jean@scibatisseur.ci', 'lotiges_erp', 'new', now() - INTERVAL '2 hours'),
('Aminata Sylla (Agence Immo Plus)', '01 02 03 04 05', 'aminata@immoplus.ci', 'gespat', 'closed', now() - INTERVAL '1 day'),
('Koffi B. (Aménagement Pro)', '05 06 07 08 09', 'koffi@amenagement.ci', 'suit_foncier', 'in_progress', now() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- 7.8. Pages Légales
INSERT INTO pages (id, title, meta_description, content_html) VALUES
('privacy', 'Politique de Confidentialité', 'Politique de confidentialité et protection des données personnelles de ZIV PROPTECH, conforme à la réglementation ivoirienne (ARTCI).', '<h2>1. Préambule et Cadre Légal</h2><p>La société ALERTE FONCIER accorde une importance majeure à la confidentialité...</p>'),
('terms', 'Conditions Générales (CGU/CGV)', 'Conditions générales d''utilisation et de vente de la suite logicielle ZIV PROPTECH.', '<h2>1. Objet</h2><p>Les présentes CGU/CGV ont pour objet de définir les conditions dans lesquelles la société ALERTE FONCIER met à disposition ses logiciels...</p>')
ON CONFLICT (id) DO NOTHING;

-- 7.9. Textes Dynamiques
INSERT INTO site_sections (section_key, title, subtitle, content_text, button_text) VALUES
('hero', 'Pilotez toute votre activité Immobilière avec ZIV.', 'Développé par Alerte Foncier', 'La première suite PropTech conçue pour les réalités de la Côte d''Ivoire et de l''Afrique de l''Ouest. Générez des leads, gérez vos chantiers, vos ventes et vos locataires sur une seule plateforme.', 'Démarrer ma Démo'),
('about', 'L''Expertise PropTech 100% Ouest-Africaine', 'Conformité Législation Ivoirienne', 'Développée par Alerte Foncier, ZIV n''est pas un logiciel importé et adapté à la hâte. C''est une suite conçue dès le premier jour pour résoudre les défis réels (ACD, VEFA, LBC, OHADA).', 'Prendre RDV avec un expert'),
('cta_footer', 'Démarrons Votre Projet d''Acquisition', 'Acquisition Transparente', 'Demandez un devis personnalisé ou une démonstration gratuite pour entamer la digitalisation de vos processus immobiliers.', 'Demander un Devis & Démo B2B')
ON CONFLICT (section_key) DO NOTHING;

-- 7.10. Chatbot Flows
INSERT INTO chatbot_flows (step_key, message_text, options_json) VALUES
('start', 'Bonjour ! 👋 Bienvenue sur ZIV PROPTECH. Pour vous guider précisément, quelle est votre activité principale ?', '[{"text": "🏢 Promotion Immobilière", "next": "promo"}, {"text": "🤝 Agence / Gestion", "next": "agence"}, {"text": "🗺️ Aménagement Foncier", "next": "foncier"}, {"text": "⚖️ Notaire / Juridique", "next": "juridique"}]'),
('promo', 'Parfait. Pour la promotion, notre **ERP** gère tout, et notre module **LOTIGES CRM** booste vos ventes VEFA.', '[{"text": "Découvrir LOTIGES ERP", "action": "open_erp"}, {"text": "Voir le module VEFA", "action": "open_lotiges"}, {"text": "📞 Consulter un expert", "action": "open_expert"}]')
ON CONFLICT (step_key) DO NOTHING;

-- 7.11. Statistiques Analytiques de base
INSERT INTO visitor_stats (visit_date, country_code, country_name, unique_visitors, page_views) VALUES
(CURRENT_DATE, 'CI', 'Côte d''Ivoire', 185, 540),
(CURRENT_DATE, 'SN', 'Sénégal', 24, 65),
(CURRENT_DATE, 'ML', 'Mali', 14, 42),
(CURRENT_DATE - INTERVAL '1 day', 'CI', 'Côte d''Ivoire', 160, 480)
ON CONFLICT (visit_date, country_code) DO NOTHING;
