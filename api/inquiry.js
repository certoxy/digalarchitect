const clean = (value, max) => String(value || '').trim().slice(0, max);

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  const body = request.body || {};
  if (clean(body.website, 100)) return response.status(200).json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const phone = clean(body.phone, 40);
  const projectType = clean(body.projectType, 120);
  const location = clean(body.location, 160);
  const message = clean(body.message, 3000);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !validEmail || !projectType || !location || !message) {
    return response.status(400).json({ error: 'Please complete all required fields.' });
  }

  if (!process.env.RESEND_API_KEY) {
    return response.status(503).json({ error: 'Email delivery is being configured. Please message us on Facebook for now.' });
  }

  const sender = process.env.INQUIRY_FROM || 'Digal Website <inquiries@send.paotechs.com>';
  const officeEmail = process.env.INQUIRY_TO || 'digaloffice2017@gmail.com';
  const inquirySummary = [
    `Project type: ${projectType}`,
    `Project location: ${location}`,
    `Phone: ${phone || 'Not provided'}`,
    '',
    'Project details:',
    message
  ].join('\n');

  const emailResponse = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([
      {
        from: sender,
        to: [officeEmail],
        reply_to: email,
        subject: `New Digal website inquiry — ${projectType}`,
        text: [
          'New website inquiry',
          '',
          `Name: ${name}`,
          `Email: ${email}`,
          inquirySummary
        ].join('\n')
      },
      {
        from: sender,
        to: [email],
        reply_to: officeEmail,
        subject: 'We received your Digal Architect project inquiry',
        text: [
          `Hello ${name},`,
          '',
          'Thank you for contacting Digal Architect & Builders. We received your project inquiry and our team will review it and respond as soon as possible.',
          '',
          'Here is a copy of your inquiry:',
          '',
          inquirySummary,
          '',
          'Digal Architect & Builders',
          '3rd Floor, The Court Building',
          'Upper Belderol Street, Tagbilaran City, Philippines',
          'Facebook: https://www.facebook.com/AR.ERVEN'
        ].join('\n')
      }
    ])
  });

  if (!emailResponse.ok) {
    console.error('Resend delivery failed', emailResponse.status);
    return response.status(502).json({ error: 'We could not send your inquiry. Please try again or message us on Facebook.' });
  }

  return response.status(200).json({ ok: true });
};
