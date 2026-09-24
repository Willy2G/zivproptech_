import nodemailer from 'nodemailer';

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

export async function sendEmail(settings, to, subject, htmlContent) {
  try {
    const fromAddress = settings.email_from_address || 'noreply@immosuit.com';
    const fromName = settings.email_from_name || 'IMMOSUIT';

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

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`✅ Email envoyé à ${to} | ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur envoi email à ${to}:`, error.message);
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

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    const responseData = await response.text();
    console.log(`📨 SMS Campaign -> ${response.status} | ${responseData}`);

    if (response.status >= 200 && response.status < 300) {
      try { return JSON.parse(responseData); } catch { return responseData; }
    }

    return false;
  } catch (error) {
    console.error('❌ Erreur campagne SMS:', error.message);
    return false;
  }
}
