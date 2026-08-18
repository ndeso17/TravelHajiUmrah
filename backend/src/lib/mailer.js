import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// SMTP opsional — jika env kosong, berjalan sebagai stub (warning, tidak benar-benar kirim)
function isConfigured() {
  return Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);
}

export async function sendEmail(to, subject, html) {
  if (!isConfigured()) {
    console.warn(`[mailer] stub mode: SMTP tidak dikonfigurasi — email tidak dikirim (to=${to}, subject=${subject})`);
    return { ok: true, stub: true };
  }

  const transport = nodemailer.createTransport({
    host: env.smtp.host,
    port: 587,
    secure: false,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });

  await transport.sendMail({ from: env.smtp.user, to, subject, html });
  return { ok: true };
}