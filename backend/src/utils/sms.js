function hasTwilioEnv() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
}

async function sendChildIdSms({ toPhone, childId, clinicianName }) {
  const text = `Your clinician (${clinicianName}) accepted your request. Child ID: ${childId}. Use this ID to log in.`;

  if (!hasTwilioEnv()) {
    console.log('[SMS disabled] Would send to:', toPhone);
    console.log(text);
    return { delivered: false, provider: null };
  }

  // Lazy import so the app can run without Twilio env configured
  // eslint-disable-next-line global-require
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const msg = await client.messages.create({
      from: process.env.TWILIO_FROM_NUMBER,
      to: toPhone,
      body: text,
    });
    return { delivered: true, provider: 'twilio', sid: msg.sid };
  } catch (err) {
    console.error('SMS send failed:', err?.message || err);
    return { delivered: false, provider: 'twilio', error: 'send_failed' };
  }
}

module.exports = { sendChildIdSms };

