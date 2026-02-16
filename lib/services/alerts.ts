/**
 * Booking alert service
 * Sends notifications when new bookings are made
 */

import nodemailer from 'nodemailer';
import { env } from '@/lib/utils/env';

interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  totalPrice: number;
  totalBasePrice: number;
  totalMarkup: number;
  netProfit: number;
  property: {
    name: string;
    operatorName: string;
    operatorEmail: string | null;
    operatorContact: string;
    operatorBookingUrl: string | null;
  };
}

/**
 * Send booking alert via email and Slack
 */
export async function sendBookingAlert(booking: Booking) {
  // Send email alert
  if (env.SMTP_HOST && env.SMTP_USER) {
    await sendEmailAlert(booking);
  }

  // Send Slack alert
  if (env.SLACK_WEBHOOK_URL) {
    await sendSlackAlert(booking);
  }
}

/**
 * Send email alert
 */
async function sendEmailAlert(booking: Booking) {
  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });

    const checkInStr = booking.checkIn.toLocaleDateString('en-AU');
    const checkOutStr = booking.checkOut.toLocaleDateString('en-AU');

    const emailHtml = `
      <h2>🎉 New Booking Received!</h2>

      <h3>Booking Details</h3>
      <ul>
        <li><strong>Booking ID:</strong> ${booking.id}</li>
        <li><strong>Property:</strong> ${booking.property.name}</li>
        <li><strong>Check-in:</strong> ${checkInStr}</li>
        <li><strong>Check-out:</strong> ${checkOutStr}</li>
        <li><strong>Nights:</strong> ${booking.nights}</li>
        <li><strong>Guests:</strong> ${booking.numberOfGuests}</li>
      </ul>

      <h3>Guest Information</h3>
      <ul>
        <li><strong>Name:</strong> ${booking.guestName}</li>
        <li><strong>Email:</strong> ${booking.guestEmail}</li>
        <li><strong>Phone:</strong> ${booking.guestPhone}</li>
      </ul>

      <h3>Financial Details</h3>
      <ul>
        <li><strong>Total Charged:</strong> $${booking.totalPrice.toFixed(2)} AUD</li>
        <li><strong>Base Price:</strong> $${booking.totalBasePrice.toFixed(2)}</li>
        <li><strong>Your Markup:</strong> $${booking.totalMarkup.toFixed(2)}</li>
        <li><strong>Net Profit:</strong> $${booking.netProfit.toFixed(2)}</li>
      </ul>

      <h3>Next Steps</h3>
      <p><strong>⚠️ ACTION REQUIRED:</strong> Book this with the operator immediately:</p>
      <ul>
        <li><strong>Operator:</strong> ${booking.property.operatorName}</li>
        <li><strong>Contact:</strong> ${booking.property.operatorContact}</li>
        ${booking.property.operatorEmail ? `<li><strong>Email:</strong> ${booking.property.operatorEmail}</li>` : ''}
        ${booking.property.operatorBookingUrl ? `<li><strong>Booking URL:</strong> <a href="${booking.property.operatorBookingUrl}">${booking.property.operatorBookingUrl}</a></li>` : ''}
      </ul>

      <p>Amount to pay operator: <strong>$${booking.totalBasePrice.toFixed(2)} AUD</strong></p>

      <p><a href="${env.NEXT_PUBLIC_APP_URL}/admin/bookings/${booking.id}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">View in Admin Dashboard</a></p>
    `;

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: env.ADMIN_EMAIL,
      subject: `🏔️ New Booking: ${booking.property.name} - ${checkInStr}`,
      html: emailHtml,
    });

    console.log('Email alert sent successfully');
  } catch (error) {
    console.error('Failed to send email alert:', error);
  }
}

/**
 * Send Slack alert
 */
async function sendSlackAlert(booking: Booking) {
  try {
    const checkInStr = booking.checkIn.toLocaleDateString('en-AU');
    const checkOutStr = booking.checkOut.toLocaleDateString('en-AU');

    const slackMessage = {
      text: '🎉 New Booking Received!',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 New Booking Received!',
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Property:*\n${booking.property.name}` },
            { type: 'mrkdwn', text: `*Guest:*\n${booking.guestName}` },
            { type: 'mrkdwn', text: `*Check-in:*\n${checkInStr}` },
            { type: 'mrkdwn', text: `*Check-out:*\n${checkOutStr}` },
            { type: 'mrkdwn', text: `*Nights:*\n${booking.nights}` },
            { type: 'mrkdwn', text: `*Guests:*\n${booking.numberOfGuests}` },
          ],
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Total:*\n$${booking.totalPrice.toFixed(2)} AUD` },
            { type: 'mrkdwn', text: `*Net Profit:*\n$${booking.netProfit.toFixed(2)}` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*⚠️ ACTION REQUIRED*\nBook with ${booking.property.operatorName}\nPay: $${booking.totalBasePrice.toFixed(2)} AUD`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in Admin',
              },
              url: `${env.NEXT_PUBLIC_APP_URL}/admin/bookings/${booking.id}`,
              style: 'primary',
            },
          ],
        },
      ],
    };

    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    console.log('Slack alert sent successfully');
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
  }
}
