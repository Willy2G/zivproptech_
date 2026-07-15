import { pool } from '../config/db.js';

export async function listSoftwares(_req, res) {
  try {
    const result = await pool.query('SELECT * FROM softwares ORDER BY sort_order ASC');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function updateSoftware(req, res) {
  const { id } = req.params;
  const { name, subtitle, description, price_cfa, youtube_id, cover_image, icon_name, features, benefits, is_popular, sort_order } = req.body;
  try {
    const result = await pool.query(
      `UPDATE softwares SET name=$1, subtitle=$2, description=$3, price_cfa=$4, youtube_id=$5,
       cover_image=$6, icon_name=$7, features=$8, benefits=$9, is_popular=$10, sort_order=$11
       WHERE id=$12`,
      [name, subtitle, description, price_cfa, youtube_id, cover_image, icon_name,
       JSON.stringify(features), JSON.stringify(benefits), is_popular, sort_order, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Logiciel introuvable.' });
    return res.json({ message: 'Logiciel mis à jour.', id });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}
