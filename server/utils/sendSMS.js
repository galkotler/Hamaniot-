const twilio = require('twilio');

const accountSid = process.env.TWILIO_SID || 'YOUR_TWILIO_SID';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN';
const fromNumber = process.env.TWILIO_PHONE || 'YOUR_TWILIO_PHONE';

const client = twilio(accountSid, authToken);

async function sendSMS(to, message) {
  try {
    const formatted = to.startsWith('+972') ? to : `+972${to.slice(1)}`;
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: formatted,
    });
    console.log("SMS sent:", result.sid);
    return result;
  } catch (err) {
    console.error("Failed to send SMS:", err.message);
    throw err;
  }
}

module.exports = sendSMS;