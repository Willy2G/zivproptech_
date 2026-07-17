import nodemailer from 'nodemailer';

export async function sendEmail(settings, to, subject, htmlContent) {
  try {
    const fromAddress = settings.email_from_address || 'noreply@immosuit.com';
    const fromName = settings.email_from_name || 'IMMOSUIT';

    let transportConfig = {
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail'
    };

    if (settings.smtp_host) {
      transportConfig = {
        host: settings.smtp_host,
        port: parseInt(settings.smtp_port, 10) || 587,
        secure: parseInt(settings.smtp_port, 10) === 465,
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_pass,
        }
      };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      html: htmlContent,
    });

    console.log(`Email envoyé à ${to} | ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Erreur envoi email à ${to}:`, error.message);
    return false;
  }
}

export async function sendSmsCampaign(settings, campaignTitle, contactsArr, content) {
  try {
    const token = settings.sms_api_token || '';
    const sender = (settings.sms_sender_id || 'FONCIER SMS').substring(0, 11);
    const baseUrl = (settings.sms_api_url || 'https://apis.letexto.com').replace(/\/+$/, '');
    const finalUrl = `${baseUrl}/v1/campaigns/sms`;

    if (!token) {
      console.warn('SMS non envoyé: token manquant');
      return false;
    }

    const response = await fetch(finalUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        label: campaignTitle.substring(0, 100),
        sender,
        contacts: contactsArr,
        content
      })
    });

    const responseData = await response.text();
    console.log(`SMS Campaign -> ${response.status} | ${responseData}`);

    if (response.status >= 200 && response.status < 300) {
      try { return JSON.parse(responseData); } catch { return responseData; }
    }

    return false;
  } catch (error) {
    console.error('Erreur campagne SMS:', error.message);
    return false;
  }
}
