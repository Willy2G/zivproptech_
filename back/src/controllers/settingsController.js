import { pool } from '../config/db.js';
import https from 'https';

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

export async function getSmsBalance(_req, res) {
  try {
    const result = await pool.query('SELECT sms_api_url, sms_api_token FROM global_settings WHERE id=1');
    const row = result.rows[0];
    if (!row || !row.sms_api_token) return res.json({ balance: 0 });

    const token = row.sms_api_token;
    const baseUrl = (row.sms_api_url || 'https://apis.letexto.com').replace(/\/+$/, '');
    
    // Pour éviter tout blocage SSL
    const agent = new https.Agent({ rejectUnauthorized: false });
    const response = await fetch(`${baseUrl}/v1/users/balance?token=${token}`, {
      headers: { 'Content-Type': 'application/json' },
      dispatcher: agent // En Node 18+ undici dispatcher, ou on laisse Node.js ignorer
    });
    
    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      if (data.balance !== undefined) return res.json({ balance: data.balance });
      if (data['"balance'] !== undefined) return res.json({ balance: data['"balance'] }); // If the JSON is slightly malformed
    } catch {
      // Regex if JSON is completely malformed (as implied by PHP script)
      const match = text.match(/\d+/);
      if (match) return res.json({ balance: parseInt(match[0], 10) });
    }
    return res.json({ balance: 0 });
  } catch (err) {
    console.error('Erreur getSmsBalance:', err);
    return res.json({ balance: 0 }); // Fallback silencieux pour l'UI
  }
}

const ALLOWED_COLUMNS = new Set([
  'seo_title', 'seo_meta_desc', 'seo_keywords', 'seo_og_image',
  'google_analytics_id', 'facebook_pixel_id',
  'chatbot_is_active', 'chatbot_tooltip_msg', 'chatbot_welcome_msg',
  'primary_color', 'secondary_color', 'logo_url', 'favicon_url',
  'contact_phones', 'contact_email', 'contact_address',
  'facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url',
  'maintenance_mode',
  'sms_api_url', 'sms_api_key', 'sms_api_token', 'sms_sender_id',
  'notification_cc_emails', 'notification_cc_phones',
  'calendly_url',
  'demo_video_url',
  'guide_document_url', 'guide_email_subject', 'guide_email_content',
  'email_from_address', 'email_from_name',
  'smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass',
]);

export async function updateSettings(req, res) {
  const fields = req.body;
  const keys = Object.keys(fields).filter(k => k !== 'id' && ALLOWED_COLUMNS.has(k));

  if (keys.length === 0) {
    return res.status(400).json({ message: 'Aucun champ valide à mettre à jour.' });
  }

  const setClauses = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
  const values = keys.map(k => fields[k]);

  try {
    const existing = await pool.query('SELECT id FROM global_settings WHERE id=1');

    if (existing.rowCount === 0) {
      const cols = ['id', ...keys].join(', ');
      const placeholders = ['1', ...keys.map((_, i) => `$${i + 1}`)].join(', ');
      await pool.query(
        `INSERT INTO global_settings (${cols}) VALUES (${placeholders})`,
        values
      );
    } else {
      await pool.query(
        `UPDATE global_settings SET ${setClauses} WHERE id=1`,
        values
      );
    }

    return res.json({ message: 'Configuration mise à jour.' });
  } catch (err) {
    console.error('Erreur updateSettings:', err.message);
    return res.status(500).json({ message: 'Erreur serveur : ' + err.message });
  }
}
