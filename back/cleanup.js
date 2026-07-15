import { pool } from './src/config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function cleanup() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Deduplicate testimonials - keep only the oldest row per (client_name, sort_order)
    await client.query(`
      DELETE FROM testimonials WHERE id NOT IN (
        SELECT DISTINCT ON (client_name, sort_order) id
        FROM testimonials
        ORDER BY client_name, sort_order, created_at ASC
      )
    `);

    // Deduplicate faqs - keep only the oldest row per (question, sort_order)
    await client.query(`
      DELETE FROM faqs WHERE id NOT IN (
        SELECT DISTINCT ON (question, sort_order) id
        FROM faqs
        ORDER BY question, sort_order, created_at ASC
      )
    `);

    // Deduplicate blog_posts - keep only the oldest row per slug
    await client.query(`
      DELETE FROM blog_posts WHERE id NOT IN (
        SELECT DISTINCT ON (slug) id
        FROM blog_posts
        ORDER BY slug, created_at ASC
      )
    `);

    // Deduplicate leads - keep only the oldest row per (full_name, email)
    await client.query(`
      DELETE FROM leads WHERE id NOT IN (
        SELECT DISTINCT ON (full_name, email) id
        FROM leads
        ORDER BY full_name, email, created_at ASC
      )
    `);

    await client.query('COMMIT');

    const counts = {};
    for (const t of ['testimonials', 'faqs', 'blog_posts', 'leads', 'softwares']) {
      const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
      counts[t] = r.rows[0].count;
    }
    console.log('Nettoyage terminé. Compteurs :', counts);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur :', err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

cleanup();
