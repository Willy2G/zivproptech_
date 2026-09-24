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

// GET /api/leads/test-comm -> route de diagnostic pour le mail et sms
router.get('/test-comm', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM global_settings WHERE id = 1');
    const settings = r.rows[0] || {};
    
    const smtpCheck = settings.smtp_host ? 'Configured' : 'Missing';
    const smsCheck = settings.sms_api_token ? 'Configured' : 'Missing';
    
    // We try to send an email to a fake or test address
    const emailResult = settings.smtp_host 
      ? await sendEmail(settings, 'test@example.com', 'Test Diagnostique', '<p>Test email</p>')
      : false;
      
    // We try to send an SMS
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
