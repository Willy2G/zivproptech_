import { pool } from '../config/db.js';

export async function listTestimonials(_req, res) {
  try {
    const result = await pool.query('SELECT * FROM testimonials ORDER BY sort_order ASC');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function createTestimonial(req, res) {
  const { client_name, company_role, client_initials, company_name, quote, rating, status, sort_order } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO testimonials (client_name, company_role, client_initials, company_name, quote, rating, status, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [client_name, company_role, client_initials, company_name, quote, rating || 5, status || 'online', sort_order || 0]
    );
    return res.status(201).json({ message: 'Témoignage créé.', id: result.rows[0].id });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function updateTestimonial(req, res) {
  const { id } = req.params;
  const { client_name, company_role, client_initials, company_name, quote, rating, status, sort_order } = req.body;
  try {
    const result = await pool.query(
      `UPDATE testimonials SET client_name=$1, company_role=$2, client_initials=$3, company_name=$4,
       quote=$5, rating=$6, status=$7, sort_order=$8 WHERE id=$9`,
      [client_name, company_role, client_initials, company_name, quote, rating, status, sort_order, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Témoignage introuvable.' });
    return res.json({ message: 'Témoignage mis à jour.', id });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function deleteTestimonial(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM testimonials WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Témoignage introuvable.' });
    return res.json({ message: 'Témoignage supprimé.', id });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}
