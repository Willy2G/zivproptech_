import { pool } from '../config/db.js';

export async function getSettings(_req, res) {
  try {
    const result = await pool.query('SELECT * FROM global_settings WHERE id=1');
    return res.json(result.rows[0] || {});
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function getCalendlyUrl(_req, res) {
  try {
    const result = await pool.query('SELECT calendly_url FROM global_settings WHERE id=1');
    const row = result.rows[0];
    return res.json({ calendly_url: row?.calendly_url || '' });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function updateSettings(req, res) {
  const fields = req.body;
  const keys = Object.keys(fields).filter(k => k !== 'id');
  if (keys.length === 0) return res.status(400).json({ message: 'Aucun champ à mettre à jour.' });

  const setClauses = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
  const values = keys.map(k => fields[k]);

  try {
    await pool.query(`UPDATE global_settings SET ${setClauses} WHERE id=1`, values);
    return res.json({ message: 'Configuration mise à jour.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}
