import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valeurs autorisees pour le champ software_interest (alignees sur le front).
const ALLOWED_SOFTWARE = new Set([
  'lotiges_erp',
  'lotiges',
  'suit_foncier',
  'easy_vente',
  'gespat',
  'gedaj',
  'syndycarre',
  'multiple',
]);

/**
 * POST /api/leads
 * Cree une demande de devis/demo (table `leads`).
 */
export async function createLead(req, res) {
  const { full_name, phone, email, software_interest, consulting_type, message } = req.body || {};

  // --- Validation ---
  const errors = [];
  if (!full_name || full_name.trim().length < 2) errors.push('Le nom complet est requis.');
  if (!phone || phone.trim().length < 6) errors.push('Un téléphone valide est requis.');
  if (!email || !EMAIL_RE.test(email)) errors.push('Un email valide est requis.');
  if (!software_interest || !ALLOWED_SOFTWARE.has(software_interest))
    errors.push('Le logiciel sélectionné est invalide.');

  if (errors.length) {
    return res.status(400).json({ message: errors.join(' ') });
  }

  const lead = {
    id: randomUUID(),
    full_name: full_name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    software_interest,
    consulting_type: consulting_type || null,
    message: message || null,
    status: 'new',
  };

  try {
    await pool.query(
      `INSERT INTO leads (id, full_name, phone, email, software_interest, consulting_type, message, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        lead.id,
        lead.full_name,
        lead.phone,
        lead.email,
        lead.software_interest,
        lead.consulting_type,
        lead.message,
        lead.status,
      ]
    );

    return res.status(201).json({
      message: 'Demande enregistrée avec succès.',
      id: lead.id,
    });
  } catch (err) {
    console.error('Erreur INSERT lead :', err.message);
    return res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement.' });
  }
}

/**
 * GET /api/leads
 * Liste les demandes (usage back-office / CRM). A protéger par authentification.
 */
export async function listLeads(_req, res) {
  try {
    const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (err) {
    console.error('Erreur SELECT leads :', err.message);
    return res.status(500).json({ message: 'Erreur serveur lors de la lecture.' });
  }
}

const ALLOWED_STATUS = new Set(['new', 'in_progress', 'closed']);

/**
 * PATCH /api/leads/:id
 * Met a jour le statut d'un lead (back-office CRM).
 */
export async function updateLeadStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!ALLOWED_STATUS.has(status)) {
    return res.status(400).json({ message: 'Statut invalide.' });
  }

  try {
    const result = await pool.query('UPDATE leads SET status = $1 WHERE id = $2', [status, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Lead introuvable.' });
    }
    return res.json({ message: 'Statut mis à jour.', id, status });
  } catch (err) {
    console.error('Erreur UPDATE lead :', err.message);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour.' });
  }
}

/**
 * DELETE /api/leads/:id
 * Supprime un lead (back-office CRM).
 */
export async function deleteLead(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM leads WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Lead introuvable.' });
    }
    return res.json({ message: 'Lead supprimé.', id });
  } catch (err) {
    console.error('Erreur DELETE lead :', err.message);
    return res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
  }
}
