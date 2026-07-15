# **DOSSIER DE DÉPLOIEMENT TECHNIQUE : ZIV PROPTECH**

**Date :** Juillet 2026

**Projet :** Plateforme Web et Back-Office ZIV PROPTECH

**Éditeur :** Société Alerte Foncier

## **1\. Vision et Objectifs du Projet**

ZIV PROPTECH est une suite de logiciels métiers destinée aux professionnels de l'immobilier en Côte d'Ivoire et dans l'UEMOA (Promoteurs, Syndics, Agences, Aménageurs).

Le but de ce déploiement est de mettre en ligne une plateforme d'acquisition de leads (Site Public) interconnectée à un Tableau de Bord d'Administration (Back-Office) dynamique.

## **2\. Inventaire des Fichiers Fournis (Assets)**

L'équipe de développement reçoit dans ce package de déploiement les fichiers suivants, qui constituent la maquette fonctionnelle et la structure de la base de données :

1. **index.html** : Le Front-End du site public (TailwindCSS, JS natif, Lucide Icons). Intègre le formulaire de leads, le chatbot guidé, et la présentation des logiciels.  
2. **Admin\_ZIV.html** : Le Front-End du Back-Office (Tableau de bord administrateur).  
3. **ziv\_proptech\_schema.sql** : Le script complet de création de la base de données relationnelle, incluant le schéma des 7 tables, les contraintes, les index et le jeu de données initial (*seeding*).  
4. **Database\_Schema\_ZIV.md** : Le dictionnaire de données expliquant les relations entre les tables.  
5. **Strategie\_Croissance.md** : La stratégie SEO et d'acquisition (pour guider l'intégration des balises et de Calendly).

## **3\. Stack Technique Recommandée**

L'architecture UI/UX étant déjà construite, l'équipe de développement est libre de choisir le langage Backend, mais voici la stack recommandée pour une performance optimale :

* **Base de Données :** MySQL 8+ ou MariaDB (Script SQL fourni).  
* **Backend (API REST) :** Laravel (PHP) OU Node.js (Express/NestJS). Le rôle du Backend sera de créer une API RESTful sécurisée.  
* **Frontend (Intégration) :** Le HTML/Tailwind fourni doit être intégré dans un moteur de template (ex: Blade pour Laravel) ou converti en composants (Vue.js / React.js).  
* **Hébergement :** VPS Cloud (DigitalOcean, AWS, ou un hébergeur local pour la souveraineté des données ivoiriennes) avec un certificat SSL obligatoire (HTTPS).

## **4\. Feuille de Route pour les Développeurs (Roadmap d'Intégration)**

### **Phase 1 : Initialisation de la Base de Données**

1. Configurer le serveur de base de données.  
2. Exécuter le script ziv\_proptech\_schema.sql fourni pour créer les tables et injecter les données initiales (Logiciels, Témoignages, FAQ, Admin par défaut).

### **Phase 2 : Développement du Backend (API)**

Créer les routes d'API nécessaires pour lier la base de données au Front-End :

* GET /api/softwares : Récupérer le catalogue pour afficher les prix et fonctionnalités sur index.html.  
* POST /api/leads : Route pour recevoir les soumissions du formulaire de contact B2B du site public.  
* GET /api/testimonials & GET /api/faqs : Pour rendre ces sections dynamiques.  
* **Authentification :** Mettre en place un système de login sécurisé (JWT ou Sessions) pour protéger l'accès à Admin\_ZIV.html. Le mot de passe haché de l'admin par défaut est fourni dans le script SQL.

### **Phase 3 : Dynamisation du Site Public (index.html)**

Remplacer les données statiques du fichier HTML fourni par des requêtes dynamiques (Fetch API ou Blade/Twig) ciblant la base de données :

* Les cartes de tarification doivent afficher le champ price\_cfa de la table softwares.  
* Le formulaire "\#leadForm" doit envoyer un POST au Backend et gérer les erreurs/succès.  
* La balise \<title\> et les métadonnées SEO doivent remonter de la table global\_settings.

### **Phase 4 : Dynamisation du Back-Office (Admin\_ZIV.html)**

* Sécuriser l'accès à la page (Redirection vers une page de login si non authentifié).  
* Connecter les tableaux (Tableau de bord, CRM) avec la table leads.  
* Activer les formulaires d'édition (Sauvegarde des prix des logiciels, publication d'un article de blog, modification de la FAQ). Les boutons "Sauvegarder" doivent déclencher des requêtes PUT ou POST vers l'API.

## **5\. Exigences de Sécurité et Conformité (ARTCI)**

Étant donné la nature B2B du projet et la collecte de données clients :

* **Protection des formulaires :** Ajouter une protection CSRF et un Rate Limiting sur la route de soumission des leads pour éviter le spam.  
* **Sécurité des mots de passe :** Utilisation obligatoire de Bcrypt pour le hachage des mots de passe administrateurs (déjà configuré dans le script SQL).  
* **Conformité :** Les formulaires de contact doivent explicitement valider la politique de confidentialité (case à cocher ou mention légale claire sous le bouton d'envoi).

## **6\. Prochaines Étapes post-déploiement**

* Créer un compte **Google Analytics 4** et intégrer l'ID dans le Back-Office.  
* Créer un compte **Calendly**, générer le lien de prise de RDV et remplacer l'URL d'exemple dans la modale d'expert d'index.html.  
* Connecter le nom de domaine officiel (zivproptech.ci ou similaire).