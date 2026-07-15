-- STREAMING_CHUNK:Initialisation de la base de données...
-- ==============================================================================
-- ZIV PROPTECH - Script BDD Complet (Structure + Données Initiales + Index)
-- Optimisé pour MySQL / MariaDB
-- ==============================================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS ziv_proptech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ziv_proptech;

-- STREAMING_CHUNK:Création de la table admins...
-- ==============================================================================
-- 1. TABLE : admins (Sécurité et accès Back Office)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admins (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'editor', 'sales') DEFAULT 'editor',
    last_login TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Création de la table leads...
-- ==============================================================================
-- 2. TABLE : leads (CRM - Demandes de devis et démos)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    software_interest VARCHAR(50) NOT NULL,
    consulting_type VARCHAR(50) DEFAULT NULL,
    message TEXT,
    status ENUM('new', 'in_progress', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Index pour accélérer le tri dans le CRM (Admin)
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_date ON leads(created_at);

-- STREAMING_CHUNK:Création de la table softwares...
-- ==============================================================================
-- 3. TABLE : softwares (Catalogue des logiciels et tarifs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS softwares (
    id VARCHAR(50) PRIMARY KEY, -- Ex: 'lotiges', 'lotiges_erp', 'gespat'
    name VARCHAR(100) NOT NULL,
    subtitle VARCHAR(200),
    description TEXT,
    price_cfa INT NOT NULL DEFAULT 0, -- 0 = Sur Devis
    youtube_id VARCHAR(50),
    cover_image VARCHAR(255),
    icon_name VARCHAR(50), -- Nom de l'icône Lucide (ex: 'building-2')
    features JSON,
    benefits JSON,
    is_popular BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Création de la table blog_posts...
-- ==============================================================================
-- 4. TABLE : blog_posts (Articles SEO & Livres Blancs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    cover_image VARCHAR(255),
    content_html LONGTEXT NOT NULL,
    meta_description VARCHAR(160),
    read_time_minutes INT DEFAULT 5,
    views_count INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    admin_id VARCHAR(36),
    published_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_blog_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);
-- Index pour la recherche SEO par URL
CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_status ON blog_posts(status);

-- STREAMING_CHUNK:Création de la table testimonials...
-- ==============================================================================
-- 5. TABLE : testimonials (Preuve Sociale B2B)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(36) PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    company_role VARCHAR(100) NOT NULL,
    client_initials VARCHAR(5) NOT NULL,
    company_name VARCHAR(100),
    quote TEXT NOT NULL,
    rating INT DEFAULT 5,
    status ENUM('online', 'offline') DEFAULT 'online',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Création de la table faqs...
-- ==============================================================================
-- 6. TABLE : faqs (Base de connaissances)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS faqs (
    id VARCHAR(36) PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    status ENUM('online', 'offline') DEFAULT 'online',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Création des tables de Contenus Avancés (Pages, Textes, Stats, Chatbot)...
-- ==============================================================================
-- 6.1. TABLE : pages (Pages légales : CGU, Confidentialité, Mentions légales)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS pages (
    id VARCHAR(50) PRIMARY KEY, -- ex: 'cgu', 'privacy'
    title VARCHAR(255) NOT NULL,
    meta_description VARCHAR(255),
    content_html LONGTEXT NOT NULL,
    last_updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6.2. TABLE : site_sections (Contenu dynamique 100% modifiable : Textes, Titres)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS site_sections (
    section_key VARCHAR(50) PRIMARY KEY, -- ex: 'hero_section', 'about_section'
    title VARCHAR(255),
    subtitle VARCHAR(255),
    content_text TEXT,
    button_text VARCHAR(100),
    image_url VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6.3. TABLE : visitor_stats (Statistiques de trafic analytique interne)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS visitor_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    visit_date DATE NOT NULL,
    country_code VARCHAR(5) NOT NULL, -- ex: 'CI', 'SN', 'ML'
    country_name VARCHAR(50),
    unique_visitors INT DEFAULT 1,
    page_views INT DEFAULT 1,
    UNIQUE KEY unique_date_country (visit_date, country_code)
);

-- ==============================================================================
-- 6.4. TABLE : chatbot_flows (Configuration interactive de l'arbre du chatbot)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS chatbot_flows (
    step_key VARCHAR(50) PRIMARY KEY, -- ex: 'start', 'promo_path'
    message_text TEXT NOT NULL,
    options_json JSON, -- Tableau de boutons et d'actions
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Mise à jour de la table global_settings...
-- ==============================================================================
-- 7. TABLE : global_settings (Configuration unique du site et charte graphique)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS global_settings (
    id INT PRIMARY KEY DEFAULT 1,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- STREAMING_CHUNK:Insertion des données de configuration globales étendues...
-- ==============================================================================
-- PEUPLEMENT DE LA BASE (SEEDING) - Démarrage direct du site
-- ==============================================================================

-- 7.1. Global Settings
INSERT IGNORE INTO global_settings (id, seo_title, seo_meta_desc, seo_keywords, chatbot_welcome_msg, facebook_url, linkedin_url, youtube_url, maintenance_mode) 
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
);

-- 7.2. Compte Admin par défaut (Mot de passe: "AdminZiv2026!")
INSERT IGNORE INTO admins (id, full_name, email, password_hash, role) 
VALUES (
    'admin-uuid-1234-5678-90ab-cdef', 
    'Super Admin ZIV', 
    'admin@zivproptech.ci', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'super_admin'
);

-- STREAMING_CHUNK:Insertion du catalogue des logiciels (ZIV Suite)...
-- 7.3. Catalogue des Logiciels (ZIV Suite)
INSERT IGNORE INTO softwares (id, name, subtitle, description, price_cfa, youtube_id, cover_image, icon_name, is_popular, sort_order, features, benefits) 
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
);

-- STREAMING_CHUNK:Insertion des Témoignages Clients B2B...
-- 7.4. Témoignages (Preuve sociale)
INSERT IGNORE INTO testimonials (id, client_name, company_role, client_initials, company_name, quote, sort_order) VALUES 
(UUID(), 'M. Sidibé Souleymane', 'Gérant (Abidjan)', 'SS', 'ORIBAT', 'Le déploiement du logiciel LOTI''GES au sein d''ORIBAT s''est parfaitement déroulé. Après une excellente formation de nos agents, la prise en main de cet outil innovant a été immédiate. C''est un véritable levier de performance.', 1),
(UUID(), 'Mme Koumba Wagué', 'Directrice Générale', 'KW', 'KOUMBA PRESTIGE CONSTRUCTION', 'En tant que promoteur immobilier agréé, nous recherchions une solution rigoureuse pour structurer nos activités. Alerte Foncier a parfaitement répondu à nos attentes avec LOTI''GES. Le déploiement a été mené de main de maître.', 2),
(UUID(), 'M. Patrick Sebatigita', 'Directeur Général', 'PS', 'INTERBAT', 'L''intégration du logiciel LOTI''GES par Alerte Foncier au sein de notre structure a été d''une grande efficacité. Grâce à un accompagnement de qualité et à la formation sur-mesure, le logiciel est aujourd''hui parfaitement opérationnel.', 3),
(UUID(), 'M. Issouf Touré', 'Directeur Général', 'IT', 'SOGETD', 'Pour piloter nos activités d''aménageur foncier et de promoteur agréé à San-Pedro, le choix de LOTI''GES s''est avéré excellent. Le cabinet Alerte Foncier a assuré un déploiement impeccable.', 4),
(UUID(), 'Mme Ouattara P. H.', 'Directrice Générale', 'OP', 'SCBAU', 'Le cabinet Alerte Foncier nous apporte une réelle valeur ajoutée avec ses outils innovants. Le déploiement de LOTI''GES nous permet aujourd''hui d''optimiser et de sécuriser la gestion de nos projets de construction.', 5),
(UUID(), 'M. Kouadio Raphael Ebouo', 'Gérant', 'KR', 'ELITE FONCIER & TOPOGRAPHIQUE', 'L''équipe d''Alerte Foncier a déployé avec succès son logiciel de gestion LOTIGES dans notre structure. Grâce à une formation rigoureuse, nos équipes maîtrisent parfaitement cet outil innovant.', 6);

-- STREAMING_CHUNK:Insertion de la Base de Connaissances (FAQ)...
-- 7.5. FAQ
INSERT IGNORE INTO faqs (id, question, answer, sort_order) VALUES
(UUID(), 'Vos logiciels sont-ils conformes à la réglementation OHADA et ivoirienne ?', 'Absolument. Contrairement aux logiciels européens, ZIV PROPTECH a été conçu nativement pour l''espace UEMOA. Notre module comptable respecte le plan comptable SYSCOHADA révisé. De plus, nos modules prennent en charge les spécificités locales comme le traitement des ACD et la réglementation LBC/FT.', 1),
(UUID(), 'Faut-il installer l''ERP sur nos serveurs ou est-ce dans le Cloud ?', 'Nous offrons les deux ! Pour une flexibilité maximale, nos modules spécialisés sont disponibles en mode SaaS (Cloud sécurisé) avec des sauvegardes quotidiennes. Pour les grandes holdings nécessitant LOTIGES ERP, nous proposons également une Licence On-Premise pour une installation sur vos propres serveurs.', 2),
(UUID(), 'Est-il possible d''intégrer ZIV avec nos moyens de paiement (Mobile Money, Banques) ?', 'Oui. L''architecture de ZIV dispose d''API ouvertes. Nous pouvons intégrer des passerelles de paiement locales (Orange Money, MTN, Moov, Wave) pour l''encaissement automatique des loyers via GESPAT ou SYNDYCARRE.', 3),
(UUID(), 'Proposez-vous un accompagnement et une formation de notre personnel ?', 'La digitalisation est avant tout humaine. Tout déploiement de ZIV s''accompagne d''un audit de vos processus actuels. Nos experts assurent ensuite la configuration du logiciel et organisent des sessions de formation pratiques pour vos équipes.', 4);

-- STREAMING_CHUNK:Insertion des données additionnelles 100% dynamiques (Pages, Textes, Stats)...
-- 7.5.1. Pages Légales (Modifiables via le Back-Office)
INSERT IGNORE INTO pages (id, title, meta_description, content_html) VALUES
('privacy', 'Politique de Confidentialité', 'Politique de confidentialité et protection des données personnelles de ZIV PROPTECH, conforme à la réglementation ivoirienne (ARTCI).', '<h2>1. Préambule et Cadre Légal</h2><p>La société ALERTE FONCIER accorde une importance majeure à la confidentialité...</p>'),
('terms', 'Conditions Générales (CGU/CGV)', 'Conditions générales d''utilisation et de vente de la suite logicielle ZIV PROPTECH.', '<h2>1. Objet</h2><p>Les présentes CGU/CGV ont pour objet de définir les conditions dans lesquelles la société ALERTE FONCIER met à disposition ses logiciels...</p>');

-- 7.5.2. Textes Dynamiques de la Page d'Accueil (Modifiables via le Back-Office)
INSERT IGNORE INTO site_sections (section_key, title, subtitle, content_text, button_text) VALUES
('hero', 'Pilotez toute votre activité Immobilière avec ZIV.', 'Développé par Alerte Foncier', 'La première suite PropTech conçue pour les réalités de la Côte d''Ivoire et de l''Afrique de l''Ouest. Générez des leads, gérez vos chantiers, vos ventes et vos locataires sur une seule plateforme.', 'Démarrer ma Démo'),
('about', 'L''Expertise PropTech 100% Ouest-Africaine', 'Conformité Législation Ivoirienne', 'Développée par Alerte Foncier, ZIV n''est pas un logiciel importé et adapté à la hâte. C''est une suite conçue dès le premier jour pour résoudre les défis réels (ACD, VEFA, LBC, OHADA).', 'Prendre RDV avec un expert'),
('cta_footer', 'Démarrons Votre Projet d''Acquisition', 'Acquisition Transparente', 'Demandez un devis personnalisé ou une démonstration gratuite pour entamer la digitalisation de vos processus immobiliers.', 'Demander un Devis & Démo B2B');

-- 7.5.3. Architecture Interactive du Chatbot
INSERT IGNORE INTO chatbot_flows (step_key, message_text, options_json) VALUES
('start', 'Bonjour ! 👋 Bienvenue sur ZIV PROPTECH. Pour vous guider précisément, quelle est votre activité principale ?', '[{"text": "🏢 Promotion Immobilière", "next": "promo"}, {"text": "🤝 Agence / Gestion", "next": "agence"}, {"text": "🗺️ Aménagement Foncier", "next": "foncier"}, {"text": "⚖️ Notaire / Juridique", "next": "juridique"}]'),
('promo', 'Parfait. Pour la promotion, notre **ERP** gère tout, et notre module **LOTIGES CRM** booste vos ventes VEFA.', '[{"text": "Découvrir LOTIGES ERP", "action": "open_erp"}, {"text": "Voir le module VEFA", "action": "open_lotiges"}, {"text": "📞 Consulter un expert", "action": "open_expert"}]');

-- 7.5.4. Statistiques Analytiques de base (Pour initialiser le Graphique du Dashboard)
INSERT IGNORE INTO visitor_stats (visit_date, country_code, country_name, unique_visitors, page_views) VALUES
(CURRENT_DATE(), 'CI', 'Côte d''Ivoire', 185, 540),
(CURRENT_DATE(), 'SN', 'Sénégal', 24, 65),
(CURRENT_DATE(), 'ML', 'Mali', 14, 42),
(CURRENT_DATE() - INTERVAL 1 DAY, 'CI', 'Côte d''Ivoire', 160, 480);

-- STREAMING_CHUNK:Insertion des articles de Blog SEO...
-- 7.6. Blog Posts (SEO Content)
INSERT IGNORE INTO blog_posts (id, title, slug, category, meta_description, status, published_at, content_html) VALUES
(UUID(), 'Lutte contre le Blanchiment de Capitaux (LBC) : Comment les agences doivent s''adapter en 2026 ?', 'conformite-lbc-agences-2026', 'Réglementation', 'Découvrez les nouvelles exigences documentaires LBC/FT pour les transactions immobilières en Côte d''Ivoire et comment le logiciel GEDAJ vous protège.', 'published', NOW(), '<p>Le secteur de l''immobilier en Côte d''Ivoire et dans l''espace UEMOA est de plus en plus encadré...</p>'),
(UUID(), 'VEFA en Côte d''Ivoire : Les 3 erreurs fatales dans la gestion des échéanciers clients', 'vefa-erreurs-gestion-echeanciers', 'Promotion', 'Gérer des appels de fonds sur Excel est risqué. Voici comment sécuriser votre trésorerie et la confiance de vos acquéreurs en VEFA.', 'published', NOW(), '<p>La Vente en l''État Futur d''Achèvement (VEFA) est le modèle de développement roi...</p>'),
(UUID(), 'Comment obtenir un ACD en Côte d''Ivoire : Étapes et coûts (Guide 2026)', 'obtenir-acd-cote-d-ivoire-etapes', 'Lotissement', 'L''Arrêté de Concession Définitive est le sésame foncier. Voici la procédure détaillée et comment le logiciel SUIT FONCIER automatise son suivi.', 'published', NOW(), '<p>L''Arrêté de Concession Définitive (ACD) est le seul document qui confère la pleine propriété...</p>'),
(UUID(), 'Calculer les tantièmes de copropriété : La méthode infaillible', 'calcul-tantiemes-copropriete-methode', 'Syndic', 'Évitez les conflits entre résidents. Apprenez à répartir les charges de copropriété de manière équitable grâce à SYNDYCARRE.', 'published', NOW(), '<p>La répartition des charges au sein d''une copropriété est la principale source de litiges...</p>');

-- STREAMING_CHUNK:Insertion de données factices pour le tableau de bord CRM...
-- 7.7. Leads (Données de test pour le Tableau de Bord Admin)
INSERT IGNORE INTO leads (id, full_name, phone, email, software_interest, status, created_at) VALUES
(UUID(), 'Jean Kouassi (SCI Bâtisseur)', '07 08 53 11 11', 'jean@scibatisseur.ci', 'lotiges_erp', 'new', NOW() - INTERVAL 2 HOUR),
(UUID(), 'Aminata Sylla (Agence Immo Plus)', '01 02 03 04 05', 'aminata@immoplus.ci', 'gespat', 'closed', NOW() - INTERVAL 1 DAY),
(UUID(), 'Koffi B. (Aménagement Pro)', '05 06 07 08 09', 'koffi@amenagement.ci', 'suit_foncier', 'in_progress', NOW() - INTERVAL 3 DAY);