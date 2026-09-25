import nodemailer from 'nodemailer';
import https from 'node:https';

/**
 * Normalise l'URL de base LeTexto.
 * L'utilisateur peut saisir :
 *   - "https://apis.letexto.com"
 *   - "https://apis.letexto.com/"
 *   - "https://apis.letexto.com/v1/campaigns/sms"
 * On extrait toujours la racine : "https://apis.letexto.com"
 */
function getLetextoBaseUrl(rawUrl) {
  const url = (rawUrl || 'https://apis.letexto.com').trim().replace(/\/+$/, '');
  // Si l'utilisateur a collé un chemin complet, on garde uniquement la racine
  const idx = url.indexOf('/v1');
  return idx !== -1 ? url.substring(0, idx) : url;
}

export async function sendEmail(settings, to, subject, htmlContent, attachments = []) {
  try {
    // Utiliser smtp_user comme expéditeur par défaut pour passer les vérifications SPF/DKIM
    const fromAddress = settings.email_from_address || settings.smtp_user || 'noreply@immosuit.com';
    const fromName = settings.email_from_name || 'ZIV PROPTECH';
    // L'enveloppe sender DOIT être le smtp_user authentifié pour que SPF passe
    const envelopeSender = settings.smtp_user || fromAddress;

    let transportConfig;

    if (settings.smtp_host) {
      // ── Mode SMTP (prioritaire si configuré) ──
      transportConfig = {
        host: settings.smtp_host,
        port: parseInt(settings.smtp_port, 10) || 587,
        secure: parseInt(settings.smtp_port, 10) === 465,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_pass,
        },
        tls: {
          rejectUnauthorized: false // Equivalent de CURLOPT_SSL_VERIFYPEER => false
        }
      };
    } else {
      // ── Mode Sendmail natif (fonctionne sur serveurs Linux de production) ──
      // Identique au comportement de PHPMailer sans ->isSMTP()
      transportConfig = {
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail'
      };
      console.log('ℹ️ SMTP non configuré → utilisation de sendmail natif (production Linux)');
    }

    const transporter = nodemailer.createTransport(transportConfig);

    console.log(`📧 Envoi email: FROM="${fromName}" <${fromAddress}> | TO=${to} | SUBJECT=${subject} | ENVELOPE=${envelopeSender}`);

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html: htmlContent,
      attachments,
      // L'enveloppe sender garantit que le serveur SMTP accepte l'email
      // et que le SPF du domaine authentifié est vérifié côté destinataire
      envelope: {
        from: envelopeSender,
        to,
      },
    });

    console.log(`✅ Email envoyé à ${to} | MessageId: ${info.messageId} | Response: ${info.response || 'OK'}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur envoi email à ${to}:`, error.message);
    console.error(`❌ Détails:`, error.stack);
    return false;
  }
}

export async function sendSmsCampaign(settings, campaignTitle, contactsArr, content) {
  try {
    const token = settings.sms_api_token || '';
    const sender = (settings.sms_sender_id || 'FONCIER SMS').substring(0, 11);
    const baseUrl = getLetextoBaseUrl(settings.sms_api_url);
    const finalUrl = `${baseUrl}/v1/campaigns/sms`;

    if (!token) {
      console.warn('⚠️ SMS non envoyé: token manquant');
      return false;
    }

    const formattedContacts = contactsArr.map(phone => {
      let clean = String(phone).replace(/\D/g, '');
      // Ajout automatique de l'indicatif 225 (Côte d'Ivoire) pour les numéros locaux
      if (clean.length === 10 && (clean.startsWith('01') || clean.startsWith('05') || clean.startsWith('07'))) {
        clean = '225' + clean;
      }
      return { numero: clean };
    });

    const bodyPayload = {
      label: campaignTitle.substring(0, 100),
      sender,
      contacts: formattedContacts,
      content
    };

    console.log('📤 Envoi SMS vers:', finalUrl);
    console.log('📤 Payload:', JSON.stringify(bodyPayload));

    // Remplacement de fetch par https.request natif pour bypasser le SSL (équivalent CURLOPT_SSL_VERIFYPEER = false)
    const urlObj = new URL(finalUrl);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      rejectUnauthorized: false, // <-- C'EST CECI QUI MANQUAIT AU POST
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(bodyPayload))
      }
    };

    const responseData = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', (e) => reject(e));
      req.write(JSON.stringify(bodyPayload));
      req.end();
    });

    console.log(`📨 SMS Campaign -> ${responseData.status} | ${responseData.body}`);

    if (responseData.status >= 200 && responseData.status < 300) {
      try { return JSON.parse(responseData.body); } catch { return responseData.body; }
    }

    return false;
  } catch (error) {
    console.error('❌ Erreur campagne SMS:', error.message);
    return false;
  }
}
