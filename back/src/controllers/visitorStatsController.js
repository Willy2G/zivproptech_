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

export async function trackVisitor(req, res) {
  const { country_code = 'CI', country_name = "Côte d'Ivoire", is_unique = false } = req.body;
  try {
    await pool.query(
      `INSERT INTO visitor_stats (visit_date, country_code, country_name, unique_visitors, page_views)
       VALUES (CURRENT_DATE, $1, $2, $3, 1)
       ON CONFLICT (visit_date, country_code) DO UPDATE
       SET page_views = visitor_stats.page_views + 1,
           unique_visitors = visitor_stats.unique_visitors + $3`,
      [country_code, country_name, is_unique ? 1 : 0]
    );
    return res.status(204).send();
  } catch (err) {
    console.error('Erreur trackVisitor:', err.message);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}
