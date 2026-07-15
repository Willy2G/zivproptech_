import { pool } from '../config/db.js';

export async function getVisitorStats(req, res) {
  const { from, to } = req.query;
  try {
    let query = `
      SELECT country_code, country_name,
             SUM(unique_visitors) AS unique_visitors,
             SUM(page_views) AS page_views
      FROM visitor_stats
    `;
    const params = [];
    const conditions = [];

    if (from) {
      params.push(from);
      conditions.push(`visit_date >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      conditions.push(`visit_date <= $${params.length}`);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY country_code, country_name ORDER BY unique_visitors DESC LIMIT 10';

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}
