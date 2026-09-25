import { Router } from 'express';
import {
  createLead,
  listLeads,
  updateLeadStatus,
  deleteLead,
  updateLead,
} from '../controllers/leadsController.js';
import { pool } from '../config/db.js';
import { sendEmail, sendSmsCampaign } from '../utils/communication.js';
import path from 'path';

const router = Router();

// POST   /api/leads      -> creation d'une demande de devis/demo (site public)
router.post('/', createLead);

// GET    /api/leads      -> liste (back-office CRM ; a proteger)
router.get('/', listLeads);

// PATCH  /api/leads/:id  -> mise a jour du statut (back-office CRM)
router.patch('/:id', updateLeadStatus);

// PUT    /api/leads/:id  -> mise a jour du lead complet (back-office CRM)
router.put('/:id', updateLead);

// DELETE /api/leads/:id  -> suppression (back-office CRM)
router.delete('/:id', deleteLead);

// POST /api/leads/send-message -> envoi d'un SMS ou email individuel depuis le CRM
router.post('/send-message', async (req, res) => {
  try {
    const { type, recipient, subject, content, attachment } = req.body || {};

    if (!type || !recipient || !content) {
      return res.status(400).json({ message: 'Les champs type, recipient et content sont requis.' });
    }

    const r = await pool.query('SELECT * FROM global_settings WHERE id = 1');
    const settings = r.rows[0] || {};

    if (type === 'email') {
      if (!settings.smtp_host) {
        return res.status(400).json({ message: 'SMTP non configuré. Allez dans Paramètres > Configuration Email.' });
      }
      const htmlContent = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#0A1E4A,#00A8B5);padding:24px;border-radius:12px 12px 0 0;">
          <h2 style="color:#fff;margin:0;font-size:18px;">${subject || 'Message'}</h2>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <p style="font-size:14px;color:#374151;line-height:1.6;">${content.replace(/\n/g, '<br/>')}</p>
          <p style="color:#9ca3af;font-size:11px;margin-top:16px;text-align:center;">ZIV PROPTECH — Message envoyé depuis le CRM</p>
        </div>
      </div>`;
      
      let attachments = [];
      if (attachment) {
        attachments.push({ path: path.join(process.cwd(), 'public', attachment) });
      }

      const result = await sendEmail(settings, recipient, subject || 'Message ZIV PROPTECH', htmlContent, attachments);
      if (!result) {
        return res.status(500).json({ message: 'Échec de l\'envoi de l\'email. Vérifiez la configuration SMTP.' });
      }
      return res.json({ message: 'Email envoyé avec succès.', success: true });
    }

    if (type === 'sms') {
      if (!settings.sms_api_token) {
        return res.status(400).json({ message: 'Token SMS non configuré. Allez dans Paramètres > Configuration SMS.' });
      }
      const result = await sendSmsCampaign(settings, 'CRM Message', [recipient], content);
      if (!result) {
        return res.status(500).json({ message: 'Échec de l\'envoi du SMS. Vérifiez la configuration SMS.' });
      }
      return res.json({ message: 'SMS envoyé avec succès.', success: true });
    }

    return res.status(400).json({ message: 'Type invalide. Utilisez "sms" ou "email".' });
  } catch (e) {
    console.error('❌ Erreur send-message:', e.message);
    res.status(500).json({ message: 'Erreur serveur: ' + e.message });
  }
});

// POST /api/leads/send-campaign -> envoi d'une campagne SMS ou email a tous les leads
router.post('/send-campaign', async (req, res) => {
  try {
    const { type, subject, content, attachment } = req.body || {};

    if (!type || !content) {
      return res.status(400).json({ message: 'Les champs type et content sont requis.' });
    }

    const r = await pool.query('SELECT * FROM global_settings WHERE id = 1');
    const settings = r.rows[0] || {};

    const leadsResult = await pool.query('SELECT email, phone FROM leads ORDER BY created_at DESC');
    const leads = leadsResult.rows;

    if (leads.length === 0) {
      return res.status(400).json({ message: 'Aucun lead en base de données.' });
    }

    let successCount = 0;
    let failCount = 0;

    if (type === 'email') {
      if (!settings.smtp_host) {
        return res.status(400).json({ message: 'SMTP non configuré.' });
      }
      const htmlContent = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#0A1E4A,#00A8B5);padding:24px;border-radius:12px 12px 0 0;">
          <h2 style="color:#fff;margin:0;font-size:18px;">${subject || 'Campagne'}</h2>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          <p style="font-size:14px;color:#374151;line-height:1.6;">${content.replace(/\n/g, '<br/>')}</p>
          <p style="color:#9ca3af;font-size:11px;margin-top:16px;text-align:center;">ZIV PROPTECH</p>
        </div>
      </div>`;

      let attachments = [];
      if (attachment) {
        attachments.push({ path: path.join(process.cwd(), 'public', attachment) });
      }

      const emails = leads.map(l => l.email).filter(Boolean);
      for (const email of emails) {
        const ok = await sendEmail(settings, email, subject || 'Campagne ZIV PROPTECH', htmlContent, attachments);
        if (ok) successCount++; else failCount++;
      }
      return res.json({ message: `Campagne email terminée : ${successCount} envoyé(s), ${failCount} échoué(s).`, successCount, failCount });
    }

    if (type === 'sms') {
      if (!settings.sms_api_token) {
        return res.status(400).json({ message: 'Token SMS non configuré.' });
      }
      const phones = leads.map(l => l.phone).filter(Boolean);
      if (phones.length === 0) {
        return res.status(400).json({ message: 'Aucun numéro de téléphone trouvé parmi les leads.' });
      }
      const result = await sendSmsCampaign(settings, 'Campagne CRM', phones, content);
      if (!result) {
        return res.status(500).json({ message: 'Échec de l\'envoi de la campagne SMS.' });
      }
      return res.json({ message: `Campagne SMS envoyée à ${phones.length} contact(s).`, success: true });
    }

    return res.status(400).json({ message: 'Type invalide.' });
  } catch (e) {
    console.error('❌ Erreur send-campaign:', e.message);
    res.status(500).json({ message: 'Erreur serveur: ' + e.message });
  }
});

// GET /api/leads/test-comm -> route de diagnostic pour le mail et sms
router.get('/test-comm', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM global_settings WHERE id = 1');
    const settings = r.rows[0] || {};
    
    const smtpCheck = settings.smtp_host ? 'Configured' : 'Missing';
    const smsCheck = settings.sms_api_token ? 'Configured' : 'Missing';
    
    const emailResult = settings.smtp_host 
      ? await sendEmail(settings, 'test@example.com', 'Test Diagnostique', '<p>Test email</p>')
      : false;
      
    const smsResult = settings.sms_api_token
      ? await sendSmsCampaign(settings, 'Test API', ['0700000000'], 'Test SMS Diagnostique')
      : false;
      
    res.json({
      status: 'Test completed',
      config: { smtp: smtpCheck, sms: smsCheck },
      results: { email: emailResult, sms: smsResult }
    });
  } catch(e) {
    res.status(500).json({ error: e.message, stack: e.stack });
  }
});

export default router;
