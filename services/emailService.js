const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPriceAlertEmails(companyName, planName, oldPrice, newPrice, subscribers) {
  if (!subscribers || subscribers.length === 0) return;

  const emails = subscribers.map(s => s.email);

  try {
    await resend.emails.send({
      from: 'Nexus Intelligence <alerts@nexus.intelligence.texrelay.site>', // Or your verified Resend domain
      to: emails,
      subject: `🚨 Price Drop Alert: ${companyName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2 style="color: #2563eb;">Nexus Market Intelligence</h2>
          <p>Strategic shift detected in <strong>${companyName}</strong> infrastructure costs.</p>
          <div style="background: #f4f4f5; padding: 15px; border-radius: 8px;">
            <p><strong>Plan:</strong> ${planName}</p>
            <p><strong>Old Price:</strong> $${oldPrice}</p>
            <p><strong>New Price:</strong> <span style="color: #16a34a;">$${newPrice}</span></p>
          </div>
          <p style="margin-top: 20px;">
            <a href="https://nexus-intelligence-six.vercel.app/reports" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Full Analysis</a>
          </p>
          <hr />
          <p style="font-size: 10px; color: #71717a;">Built by Abeeb Beloved Salam | Systems Architect</p>
        </div>
      `
    });
    console.log(`📧 Alerts sent to ${emails.length} subscribers.`);
  } catch (error) {
    console.error("❌ Email delivery failed:", error.message);
  }
}

module.exports = { sendPriceAlertEmails };