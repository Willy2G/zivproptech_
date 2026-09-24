import 'dotenv/config';
import { pool } from './src/config/db.js';
import { sendEmail, sendSmsCampaign } from './src/utils/communication.js';

async function testComm() {
  try {
    console.log('Fetching settings from DB...');
    const result = await pool.query('SELECT * FROM global_settings WHERE id = 1');
    const settings = result.rows[0];

    if (!settings) {
      console.error('No settings found in DB.');
      process.exit(1);
    }

    console.log('--- Paramètres récupérés ---');
    console.log('SMTP Host:', settings.smtp_host);
    console.log('SMTP Port:', settings.smtp_port);
    console.log('SMTP User:', settings.smtp_user ? '***' : 'non');
    console.log('SMS API URL:', settings.sms_api_url);
    console.log('SMS Token:', settings.sms_api_token ? '***' : 'non');

    // Test Email
    const testEmail = 'test@example.com';
    console.log('\n--- Test Envoi Email ---');
    const emailResult = await sendEmail(settings, testEmail, 'Test de notification ZIV', '<p>Ceci est un test</p>');
    console.log('Résultat Email:', emailResult);

    // Test SMS
    const testPhone = '0700000000'; // Fake number just to see API response format (might be rejected but we'll see the HTTP error)
    console.log('\n--- Test Envoi SMS ---');
    const smsResult = await sendSmsCampaign(settings, 'Test API', [testPhone], 'Test SMS ZIV');
    console.log('Résultat SMS:', smsResult);

  } catch (err) {
    console.error('Erreur globale du test:', err);
  } finally {
    await pool.end();
  }
}

testComm();
