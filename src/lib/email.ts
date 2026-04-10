import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true,
  auth: {
    user: 'contact@kmicare.ca',
    pass: process.env.EMAIL_PASSWORD || '',
  },
  // Timeouts pour éviter les processus bloqués indéfiniment
  connectionTimeout: 10000, // 10 secondes pour se connecter
  greetingTimeout: 10000,   // 10 secondes pour la poignée de main SMTP
  socketTimeout: 15000,     // 15 secondes max pour l'envoi complet
});

interface BookingDetails {
  service: string;
  date: string;
  time: string;
  address: string;
  customerName?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export async function sendBookingNotification(booking: BookingDetails) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #003366, #0066cc); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">&#127968; KMI Home &amp; Car Care</h1>
        <p style="color: #93c5fd; margin: 8px 0 0;">Nouvelle r&eacute;servation re&ccedil;ue !</p>
      </div>
      <div style="padding: 30px;">
        <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #22c55e;">
          <h2 style="color: #003366; margin: 0 0 16px; font-size: 18px;">&#128203; D&eacute;tails de la r&eacute;servation</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">&#129529; Service :</td><td style="padding: 8px 0; color: #1e293b;">${booking.service}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">&#128197; Date :</td><td style="padding: 8px 0; color: #1e293b;">${booking.date}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">&#128336; Heure :</td><td style="padding: 8px 0; color: #1e293b;">${booking.time}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">&#128205; Adresse :</td><td style="padding: 8px 0; color: #1e293b;">${booking.address}</td></tr>
          </table>
        </div>
        <div style="background: white; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
          <h2 style="color: #003366; margin: 0 0 16px; font-size: 18px;">&#128100; Informations client</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Nom :</td><td style="padding: 8px 0; color: #1e293b;">${booking.customerName || 'Non sp&eacute;cifi&eacute;'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">&#128222; T&eacute;l&eacute;phone :</td><td style="padding: 8px 0; color: #1e293b; font-weight: bold;">${booking.phone || 'Non sp&eacute;cifi&eacute;'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">&#9993; Email :</td><td style="padding: 8px 0; color: #1e293b;">${booking.email || 'Non sp&eacute;cifi&eacute;'}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">&#128221; Notes :</td><td style="padding: 8px 0; color: #1e293b;">${booking.notes || 'Aucune'}</td></tr>
          </table>
        </div>
        <div style="text-align: center; margin-top: 24px; padding: 16px; background: #ecfdf5; border-radius: 8px;">
          <p style="color: #166534; margin: 0; font-weight: 600;">Cette r&eacute;servation a &eacute;t&eacute; enregistr&eacute;e automatiquement.</p>
          <p style="color: #166534; margin: 8px 0 0; font-size: 14px;">Connectez-vous au <a href="https://kmicare.ca/admin" style="color: #2563eb;">tableau de bord</a> pour g&eacute;rer vos r&eacute;servations.</p>
        </div>
      </div>
      <div style="background: #1e293b; padding: 20px; text-align: center;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">KMI Home &amp; Car Care</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"KMI Home & Car Care" <contact@kmicare.ca>',
      to: 'contact@kmicare.ca',
      subject: `Nouvelle reservation - ${booking.service} le ${booking.date}`,
      html: htmlContent,
    });
    console.log('Email de notification envoye avec succes');
    return true;
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return false;
  }
}

// Validation basique de format email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Email au client quand l'admin change le statut
export async function sendStatusUpdateEmail(
  clientEmail: string,
  status: 'confirmed' | 'cancelled' | 'completed',
  booking: { service: string; date: string; time: string; address: string; customerName?: string }
) {
  if (!clientEmail || !isValidEmail(clientEmail)) {
    console.log('Email non envoye: adresse invalide ou absente (' + (clientEmail || 'vide') + ')');
    return false;
  }

  const isConfirmed = status === 'confirmed';
  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed';

  let statusColor = '#22c55e';
  let statusIcon = '&#10004;';
  let statusText = 'Confirm\u00e9e';
  let statusMessage = 'Votre r\u00e9servation a \u00e9t\u00e9 confirm\u00e9e par notre \u00e9quipe. Nous serons au rendez-vous !';
  let subjectLine = 'Votre r\u00e9servation a \u00e9t\u00e9 confirm\u00e9e';
  let headerSubtitle = 'Mise \u00e0 jour de votre r\u00e9servation';

  if (isCancelled) {
    statusColor = '#ef4444';
    statusIcon = '&#10060;';
    statusText = 'Annul\u00e9e';
    statusMessage = "Malheureusement, votre r\u00e9servation a d\u00fb \u00eatre annul\u00e9e pour des raisons ind\u00e9pendantes de notre volont\u00e9. Un membre de notre \u00e9quipe vous contactera tr\u00e8s prochainement afin de convenir d'un nouveau rendez-vous.";
    subjectLine = 'Votre r\u00e9servation a \u00e9t\u00e9 annul\u00e9e';
  } else if (isCompleted) {
    statusColor = '#3b82f6';
    statusIcon = '&#127881;';
    statusText = 'Termin\u00e9e';
    statusMessage = 'Votre service a \u00e9t\u00e9 compl\u00e9t\u00e9 avec succ\u00e8s. Merci infiniment de nous avoir fait confiance !';
    subjectLine = 'Merci pour votre confiance !';
    headerSubtitle = 'Merci pour votre confiance !';
  }

  const clientName = booking.customerName ? ' ' + booking.customerName : '';

  let topBlock = '';
  if (isCompleted) {
    topBlock = '<div style="text-align: center; margin-bottom: 20px;"><p style="font-size: 48px; margin: 0;">&#127881;</p><h2 style="color: #003366; margin: 12px 0 8px; font-size: 22px;">Merci' + clientName + ' !</h2><p style="color: #64748b; margin: 0; font-size: 15px; line-height: 1.6;">' + statusMessage + '<br>Nous esp\u00e9rons vous revoir tr\u00e8s bient\u00f4t !</p></div>';
  } else {
    const statusBg = isConfirmed ? '#ecfdf5' : '#fef2f2';
    topBlock = '<div style="background: ' + statusBg + '; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px; border: 2px solid ' + statusColor + ';"><p style="font-size: 48px; margin: 0;">' + statusIcon + '</p><h2 style="color: ' + statusColor + '; margin: 12px 0 8px; font-size: 22px;">R\u00e9servation ' + statusText + '</h2><p style="color: #64748b; margin: 0; font-size: 15px;">' + statusMessage + '</p></div>';
  }

  let bottomSection = '';
  if (isConfirmed) {
    bottomSection = '<div style="text-align: center; margin-top: 20px; padding: 16px; background: #eff6ff; border-radius: 8px;"><p style="color: #1e40af; margin: 0; font-size: 14px;">Pour toute question, contactez-nous \u00e0 <strong>contact@kmicare.ca</strong></p></div>';
  } else if (isCancelled) {
    bottomSection = '<div style="text-align: center; margin-top: 20px; padding: 16px; background: #fff7ed; border-radius: 8px;"><p style="color: #9a3412; margin: 0; font-size: 14px;">Nous vous contacterons sous peu pour planifier un nouveau rendez-vous.<br>Vous pouvez aussi nous joindre directement \u00e0 <strong>contact@kmicare.ca</strong></p></div>';
  } else {
    bottomSection = '<div style="text-align: center; margin-top: 20px; padding: 24px; background: #f0f9ff; border-radius: 12px; border: 1px solid #bae6fd;"><p style="font-size: 28px; margin: 0 0 8px;">&#11088;&#11088;&#11088;&#11088;&#11088;</p><p style="color: #0c4a6e; margin: 0 0 12px; font-size: 15px; font-weight: 600;">Votre satisfaction est notre priorit\u00e9 !</p><p style="color: #64748b; margin: 0 0 16px; font-size: 14px;">Nous serions ravis de vous compter parmi notre communaut\u00e9.</p><a href="https://www.facebook.com/profile.php?id=61578436334077" style="display: inline-block; background: #1877F2; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">&#128077; Suivez KMI Home &amp; Car Care sur Facebook</a><p style="color: #94a3b8; margin: 12px 0 0; font-size: 12px;">\u00c0 tr\u00e8s bient\u00f4t pour un prochain service !</p></div>';
  }

  const detailsTitle = isCompleted ? 'R\u00e9capitulatif du service' : 'Rappel de votre r\u00e9servation';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #003366, #0066cc); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">&#127968; KMI Home &amp; Car Care</h1>
        <p style="color: #93c5fd; margin: 8px 0 0;">${headerSubtitle}</p>
      </div>
      <div style="padding: 30px;">
        ${topBlock}
        <div style="background: white; border-radius: 8px; padding: 20px; border-left: 4px solid ${statusColor};">
          <h3 style="color: #003366; margin: 0 0 16px; font-size: 16px;">&#128203; ${detailsTitle}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 120px;">&#129529; Service :</td><td style="padding: 8px 0; color: #1e293b;">${booking.service}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">&#128197; Date :</td><td style="padding: 8px 0; color: #1e293b;">${booking.date}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">&#128336; Heure :</td><td style="padding: 8px 0; color: #1e293b;">${booking.time}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600;">&#128205; Adresse :</td><td style="padding: 8px 0; color: #1e293b;">${booking.address}</td></tr>
          </table>
        </div>
        ${bottomSection}
      </div>
      <div style="background: #1e293b; padding: 20px; text-align: center;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">KMI Home &amp; Car Care \u2014 Nettoyage professionnel \u00e0 domicile</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"KMI Home & Car Care" <contact@kmicare.ca>',
      to: clientEmail,
      subject: subjectLine + ' - KMI Home & Car Care',
      html: htmlContent,
    });
    console.log('Email de ' + status + ' envoye a ' + clientEmail);
    return true;
  } catch (error) {
    // Silencieux : ne pas crasher si l'email est invalide
    console.error('Erreur envoi email client (' + clientEmail + '):', error);
    return false;
  }
}
