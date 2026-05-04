import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(30).optional().default(''),
  enquiryType: z.string().min(1).max(100),
  guests: z.string().max(5).optional().default(''),
  dates: z.string().max(200).optional().default(''),
  message: z.string().min(1).max(5000),
});

const RECIPIENT = 'hello@mtbawbawcascade3.com';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const { name, email, phone, enquiryType, guests, dates, message } = parsed.data;

  const isGroup = enquiryType.includes('Group');

  const textBody = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    `Enquiry Type: ${enquiryType}`,
    isGroup && guests ? `Number of Guests: ${guests}` : null,
    isGroup && dates ? `Preferred Dates: ${dates}` : null,
    '',
    'Message:',
    message,
  ]
    .filter(Boolean)
    .join('\n');

  const htmlBody = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #102a43; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
        ${isGroup ? 'Group Booking Enquiry' : 'Contact Form Enquiry'}
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; color: #627d98; width: 140px;">Name</td><td style="padding: 8px 0; color: #102a43; font-weight: 600;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 8px 0; color: #627d98;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #2563eb;">${escapeHtml(email)}</a></td></tr>
        ${phone ? `<tr><td style="padding: 8px 0; color: #627d98;">Phone</td><td style="padding: 8px 0;"><a href="tel:${escapeHtml(phone)}" style="color: #2563eb;">${escapeHtml(phone)}</a></td></tr>` : ''}
        <tr><td style="padding: 8px 0; color: #627d98;">Enquiry Type</td><td style="padding: 8px 0; color: #102a43; font-weight: 600;">${escapeHtml(enquiryType)}</td></tr>
        ${isGroup && guests ? `<tr><td style="padding: 8px 0; color: #627d98;">Guests</td><td style="padding: 8px 0; color: #102a43; font-weight: 700; font-size: 1.1em;">${escapeHtml(guests)}</td></tr>` : ''}
        ${isGroup && dates ? `<tr><td style="padding: 8px 0; color: #627d98;">Preferred Dates</td><td style="padding: 8px 0; color: #102a43;">${escapeHtml(dates)}</td></tr>` : ''}
      </table>
      <div style="background: #f0f4f8; border-radius: 8px; padding: 16px; margin-top: 16px;">
        <p style="color: #627d98; margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
        <p style="color: #102a43; margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
      <p style="color: #9fb3c8; font-size: 12px; margin-top: 24px;">
        Sent from the Cascade Apartments website contact form
      </p>
    </div>
  `;

  const subject = isGroup
    ? `Group Booking Enquiry (${guests || '?'} guests) — ${name}`
    : `${enquiryType} — ${name}`;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || `Cascade Apartments <${RECIPIENT}>`;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.error('SMTP not configured — falling back to log-only mode');
    console.log('Contact form submission:', textBody);
    return NextResponse.json({ ok: true });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPassword },
  });

  await transporter.sendMail({
    from: smtpFrom,
    to: RECIPIENT,
    replyTo: email,
    subject,
    text: textBody,
    html: htmlBody,
  });

  return NextResponse.json({ ok: true });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
