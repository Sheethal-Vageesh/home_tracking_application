const nodemailer = require('nodemailer');

function hasSmtpEnv() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendChildIdNotification({ toEmail, childId, clinicianName }) {
  const subject = 'FluentPath – Child ID for your child';
  const text = [
    `Dear Parent,`,
    ``,
    `Your clinician (${clinicianName}) has accepted your request and created a profile for your child in the FluentPath application.`,
    ``,
    `Your unique Child ID is: ${childId}`,
    ``,
    `Please keep this Child ID safe. You will need it to log in to the Parent dashboard and access the strategies assigned by your clinician.`,
    ``,
    `With best regards,`,
    `FluentPath`,
  ].join('\n');

  if (!hasSmtpEnv()) {
    console.log('[Email disabled] Would send to:', toEmail);
    console.log('Subject:', subject);
    console.log(text);
    return { delivered: false };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject,
    text,
  });

  return { delivered: true };
}

async function sendStrategiesAssignedNotification({ toEmail, childName, clinicianName, strategyTitles }) {
  const subject = 'New strategies assigned for your child';

  const list =
    strategyTitles && strategyTitles.length
      ? strategyTitles.map((t) => `• ${t}`).join('\n')
      : '• (Strategy titles not available)';

  const text = [
    `Dear Parent,`,
    ``,
    `Your clinician (${clinicianName}) has assigned new strategies for your child${childName ? ` (${childName})` : ''} in the FluentPath application.`,
    ``,
    `Assigned strategies:`,
    list,
    ``,
    `Please log in to the Parent dashboard as soon as possible to review the strategies, watch any demo videos, and begin practising them with your child.`,
    ``,
    `After each practice, kindly submit your rating and practice duration so that your clinician can monitor progress.`,
    ``,
    `With best regards,`,
    `FluentPath`,
  ].join('\n');

  if (!hasSmtpEnv()) {
    console.log('[Email disabled] Would send to:', toEmail);
    console.log('Subject:', subject);
    console.log(text);
    return { delivered: false };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject,
    text,
  });

  return { delivered: true };
}

module.exports = { sendChildIdNotification, sendStrategiesAssignedNotification };

