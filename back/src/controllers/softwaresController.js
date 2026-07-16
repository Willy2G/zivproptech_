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

export async function createSoftware(req, res) {
  const { id, name, subtitle, description, price_cfa, youtube_id, cover_image, icon_name, features, benefits, is_popular, sort_order } = req.body;
  if (!id || !name) return res.status(400).json({ message: 'ID et Nom sont requis.' });
  try {
    await pool.query(
      `INSERT INTO softwares (id, name, subtitle, description, price_cfa, youtube_id, cover_image, icon_name, features, benefits, is_popular, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, name, subtitle, description, price_cfa, youtube_id, cover_image, icon_name,
       JSON.stringify(features || []), JSON.stringify(benefits || []), is_popular || false, sort_order || 0]
    );
    return res.status(201).json({ message: 'Logiciel créé.', id });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'Cet ID existe déjà.' });
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}

export async function deleteSoftware(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM softwares WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Logiciel introuvable.' });
    return res.json({ message: 'Logiciel supprimé.' });
  } catch (err) {
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
}
