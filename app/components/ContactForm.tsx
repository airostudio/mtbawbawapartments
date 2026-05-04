'use client';

import { useState } from 'react';

const enquiryTypes = [
  'General Enquiry',
  'Group Booking (up to 21 guests)',
  'Apartment 3 Enquiry',
  'Apartment 4 Enquiry',
  'Apartment 6 Enquiry',
  'Other',
];

const RECIPIENT = 'hello@mtbawbawcascade3.com';

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    enquiryType: 'General Enquiry',
    guests: '',
    dates: '',
    message: '',
  });

  const isGroupBooking = form.enquiryType === 'Group Booking (up to 21 guests)';

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const subject = isGroupBooking
      ? `Group Booking Enquiry (${form.guests || '?'} guests) – ${form.name}`
      : `${form.enquiryType} – ${form.name}`;

    const lines = [
      `Name: ${form.name}`,
      form.phone ? `Phone: ${form.phone}` : '',
      `Enquiry Type: ${form.enquiryType}`,
      isGroupBooking && form.guests ? `Number of Guests: ${form.guests}` : '',
      isGroupBooking && form.dates ? `Preferred Dates: ${form.dates}` : '',
      '',
      form.message,
    ].filter(Boolean).join('\n');

    const mailto = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
    window.location.href = mailto;
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'white',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 600 as const,
    color: '#93c5fd',
    marginBottom: '0.375rem',
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Name */}
        <div>
          <label style={labelStyle}>Name *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Your name"
            className="contact-input"
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
            className="contact-input"
            style={inputStyle}
          />
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle}>Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="04xx xxx xxx"
            className="contact-input"
            style={inputStyle}
          />
        </div>

        {/* Enquiry Type */}
        <div>
          <label style={labelStyle}>Enquiry Type *</label>
          <select
            required
            value={form.enquiryType}
            onChange={(e) => update('enquiryType', e.target.value)}
            className="contact-input"
            style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const }}
          >
            {enquiryTypes.map((t) => (
              <option key={t} value={t} style={{ background: '#1e3a52', color: 'white' }}>{t}</option>
            ))}
          </select>
        </div>

        {/* Group-specific fields */}
        {isGroupBooking && (
          <>
            <div>
              <label style={labelStyle}>Number of Guests *</label>
              <select
                required
                value={form.guests}
                onChange={(e) => update('guests', e.target.value)}
                className="contact-input"
                style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const }}
              >
                <option value="" style={{ background: '#1e3a52' }}>Select...</option>
                {Array.from({ length: 21 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n} style={{ background: '#1e3a52', color: 'white' }}>
                    {n} {n === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Preferred Dates</label>
              <input
                type="text"
                value={form.dates}
                onChange={(e) => update('dates', e.target.value)}
                placeholder="e.g. 15-18 July 2026"
                className="contact-input"
                style={inputStyle}
              />
            </div>
          </>
        )}
      </div>

      {/* Message */}
      <div style={{ marginTop: '1.25rem' }}>
        <label style={labelStyle}>Message *</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          placeholder={isGroupBooking
            ? 'Tell us about your group — any special requirements, occasion, etc.'
            : 'How can we help?'}
          className="contact-input"
          style={{ ...inputStyle, resize: 'vertical' as const }}
        />
      </div>

      {/* Submit */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button
          type="submit"
          className="cta-button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.875rem 2.25rem',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(37,99,235,0.4)',
          }}
        >
          Send via Email
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
        <p style={{
          fontSize: '0.75rem',
          color: 'rgba(147,197,253,0.4)',
          marginTop: '0.75rem',
        }}>
          Opens your email client to send to {RECIPIENT}
        </p>
      </div>
    </form>
  );
}
