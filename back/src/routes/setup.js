import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/', async (req, res) => {
  try {
    // Chemin vers le fichier SQL de PostgreSQL
    const schemaPath = path.join(__dirname, '../../database/schema.postgres.sql');
    
    if (!fs.existsSync(schemaPath)) {
      return res.status(404).send('<h1>Erreur</h1><p>Le fichier schema.postgres.sql est introuvable.</p>');
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    // Exécution du script complet
    await pool.query(sql);
    
    res.send(`
      <html>
        <head>
          <title>Déploiement Réussi</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; }
            .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block; }
            h1 { color: #28a745; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Déploiement réussi !</h1>
            <p>La base de données PostgreSQL a été initialisée et les données de base (catalogue, admin) ont été insérées.</p>
            <a href="/">Retour au site</a>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Erreur lors du déploiement :', err);
    res.status(500).send(`
      <html>
        <head>
          <title>Erreur de Déploiement</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; }
            .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block; max-width: 800px; text-align: left; }
            h1 { color: #dc3545; text-align: center; }
            pre { background: #eee; padding: 10px; border-radius: 4px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Erreur lors du déploiement</h1>
            <p>Impossible d'exécuter le script SQL. Vérifiez la connexion à PostgreSQL et assurez-vous que la base de données est créée.</p>
            <pre>${err.message}</pre>
          </div>
        </body>
      </html>
    `);
  }
});

router.get('/migrate', async (req, res) => {
  try {
    const migrationPath = path.join(__dirname, '../../database/migrations.postgres.sql');
    
    if (!fs.existsSync(migrationPath)) {
      return res.status(404).send('<h1>Erreur</h1><p>Le fichier migrations.postgres.sql est introuvable.</p>');
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Exécuter les migrations de façon sécurisée
    await pool.query(sql);
    
    res.send(`
      <html>
        <head><title>Migration Réussie</title><style>body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; } .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block; } h1 { color: #28a745; }</style></head>
        <body>
          <div class="container">
            <h1>✅ Migrations exécutées avec succès !</h1>
            <p>La base de données a été mise à jour à partir du fichier <code>migrations.postgres.sql</code> <b>sans aucune perte de données</b>.</p>
            <a href="/admin/seo">Retour au Backoffice</a>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Erreur de migration :', err);
    res.status(500).send(`
      <html>
        <head><title>Erreur de Migration</title><style>body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; } .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block; max-width: 800px; text-align: left;} h1 { color: #dc3545; text-align: center; } pre { background: #eee; padding: 10px; border-radius: 4px; overflow-x: auto; }</style></head>
        <body>
          <div class="container">
            <h1>❌ Erreur lors de la migration</h1>
            <pre>${err.message}</pre>
          </div>
        </body>
      </html>
    `);
  }
});

export default router;
