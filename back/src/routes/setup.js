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

export default router;
