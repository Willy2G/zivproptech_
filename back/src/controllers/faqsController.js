import { pool } from '../config/db.js';

export async function listFaqs(_req, res) {
  try {
    const result = await pool.query('SELECT * FROM faqs ORDER BY sort_order ASC');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function createFaq(req, res) {
  const { question, answer, sort_order, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO faqs (question, answer, sort_order, status) VALUES ($1,$2,$3,$4) RETURNING id`,
      [question, answer, sort_order || 0, status || 'online']
    );
    return res.status(201).json({ message: 'FAQ créée.', id: result.rows[0].id });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function updateFaq(req, res) {
  const { id } = req.params;
  const { question, answer, sort_order, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE faqs SET question=$1, answer=$2, sort_order=$3, status=$4 WHERE id=$5`,
      [question, answer, sort_order, status, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'FAQ introuvable.' });
    return res.json({ message: 'FAQ mise à jour.', id });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function deleteFaq(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM faqs WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'FAQ introuvable.' });
    return res.json({ message: 'FAQ supprimée.', id });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}
