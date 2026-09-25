import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';
import { sendEmail, sendSmsCampaign } from '../utils/communication.js';

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
  'Guide Digitalisation',
  'Rendez-vous',
]);

/**
 * POST /api/leads
 * Cree une demande de devis/demo (table `leads`).
 */
export async function createLead(req, res) {
  let { full_name, phone, email, software_interest, consulting_type, message } = req.body || {};

  email = email ? email.trim().toLowerCase() : '';
  phone = phone ? phone.replace(/[^\d+]/g, '') : '';

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

    // --- Récupérer les paramètres globaux pour les notifications ---
    const settingsResult = await pool.query('SELECT * FROM global_settings WHERE id = 1');
    const settings = settingsResult.rows.length > 0 ? settingsResult.rows[0] : {};

    // Parser les destinataires CC depuis les settings
    const ccEmails = (settings.notification_cc_emails || '')
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);
    const ccPhones = (settings.notification_cc_phones || '')
      .split(',')
      .map(p => p.trim().replace(/[^\d+]/g, ''))
      .filter(p => p.length > 5);

    // --- Email HTML de notification interne (pour les CC) ---
    const notifSubject = `🔔 Nouveau prospect : ${lead.full_name} — ${lead.software_interest}`;
    const notifHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0A1E4A, #00A8B5); padding: 24px; border-radius: 12px 12px 0 0;">
          <h2 style="color: #fff; margin: 0; font-size: 20px;">🔔 Nouveau Lead Enregistré</h2>
        </div>
        <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Nom</td><td style="padding: 8px 0; font-weight: bold; font-size: 14px;">${lead.full_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email</td><td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Téléphone</td><td style="padding: 8px 0; font-size: 14px;"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Intérêt</td><td style="padding: 8px 0; font-weight: bold; color: #00A8B5; font-size: 14px;">${lead.software_interest}</td></tr>
            ${lead.consulting_type ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Type conseil</td><td style="padding: 8px 0; font-size: 14px;">${lead.consulting_type}</td></tr>` : ''}
            ${lead.message ? `<tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Message</td><td style="padding: 8px 0; font-size: 14px;">${String(lead.message).replace(/\n/g, '<br/>')}</td></tr>` : ''}
          </table>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 16px; text-align: center;">Notification automatique — ZIV PROPTECH CRM</p>
        </div>
      </div>
    `;

    // SMS de notification interne (pour les CC)
    const notifSms = `Nouveau lead: ${lead.full_name} | ${lead.software_interest} | Tel: ${lead.phone} | Email: ${lead.email}`;

    // --- Logique spécifique : Guide Digitalisation ---
    if (lead.software_interest === 'Guide Digitalisation') {
      const subject = settings.guide_email_subject || 'Voici votre guide de la Digitalisation Immobilière';
      const documentUrl = settings.guide_document_url || '#';
      const bodyContent = settings.guide_email_content || 'Bonjour, merci pour votre téléchargement. Veuillez trouver le guide ci-joint.';

      const htmlContent = `
        <p>${bodyContent.replace(/\n/g, '<br>')}</p>
        <br/>
        <p><a href="${documentUrl}" style="background-color: #00A8B5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Télécharger le guide</a></p>
      `;

      await sendEmail(settings, lead.email, subject, htmlContent);

      if (lead.phone && lead.phone !== 'Non renseigné') {
        await sendSmsCampaign(settings, 'Guide Digitalisation', [lead.phone], 'Merci pour votre téléchargement. Vérifiez vos emails pour obtenir le guide.');
      }
    }

    // --- Logique spécifique : Rendez-vous ---
    if (lead.software_interest === 'Rendez-vous') {
      const subject = 'Nouvelle demande de Rendez-vous / Audit';
      const htmlContent = `
        <h3>Nouvelle demande de Rendez-vous</h3>
        <p><strong>Nom :</strong> ${lead.full_name}</p>
        <p><strong>Téléphone :</strong> ${lead.phone}</p>
        <p><strong>Email :</strong> ${lead.email}</p>
        <p><strong>Détails & Date souhaitée :</strong><br/> ${String(lead.message).replace(/\n/g, '<br/>')}</p>
      `;
      if (settings.contact_email) {
        await sendEmail(settings, settings.contact_email, subject, htmlContent);
      }
    }

    // --- Envoi des notifications CC (Email + SMS) pour TOUS les types de leads ---
    const ccNotifPromises = [];

    for (const ccEmail of ccEmails) {
      ccNotifPromises.push(
        sendEmail(settings, ccEmail, notifSubject, notifHtml)
          .catch(err => console.error(`Erreur notif email CC ${ccEmail}:`, err.message))
      );
    }

    if (ccPhones.length > 0) {
      ccNotifPromises.push(
        sendSmsCampaign(settings, `Lead: ${lead.full_name}`, ccPhones, notifSms)
          .catch(err => console.error('Erreur notif SMS CC:', err.message))
      );
    }

    // Lancer les notifications CC en parallèle sans bloquer la réponse
    Promise.allSettled(ccNotifPromises).then(results => {
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`${failures.length} notification(s) CC en échec.`);
      }
    });

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

const ALLOWED_STATUS = new Set(['new', 'in_progress', 'closed', 'completed', 'postponed']);

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
 * PUT /api/leads/:id
 * Met a jour un lead complet (back-office CRM).
 */
export async function updateLead(req, res) {
  const { id } = req.params;
  const { full_name, phone, email, software_interest, status, message } = req.body || {};

  try {
    const result = await pool.query(
      `UPDATE leads SET full_name = $1, phone = $2, email = $3, software_interest = $4, status = $5, message = $6 WHERE id = $7`,
      [full_name, phone, email, software_interest, status, message, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Lead introuvable.' });
    }
    return res.json({ message: 'Lead mis à jour.', id });
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
