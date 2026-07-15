import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * Pool de connexions Postgres partage par l'application.
 * Les identifiants proviennent des variables d'environnement (.env).
 */
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ziv_proptech',
});

// Verifie la connexion au demarrage (log non bloquant).
export async function checkConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Connexion Postgres établie.');
    return true;
  } catch (err) {
    console.warn('⚠️  Impossible de se connecter à Postgres :', err.message);
    console.warn("    Le serveur démarre quand même, mais les écritures en base échoueront.");
    return false;
  }
}
