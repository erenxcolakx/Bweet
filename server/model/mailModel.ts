import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import formData from 'form-data';
import Mailgun from 'mailgun.js'; // Mailgun.js modülünü kullanıyoruz
dotenv.config();

export function generateVerificationToken(userId: number) {
  const secretKey = process.env.JWT_SECRET; // Ensure you have a secret key in your .env file
  if (!secretKey) {
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }
  const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
  return token;
}

// Mailgun client'ı kurma
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere' });

export function sendVerificationEmail(userEmail: string, token: string) {
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;

  // Email verilerini oluşturma
  const emailData = {
    from: 'Your App <noreply@yourdomain.com>',
    to: userEmail,
    subject: 'Verify your email',
    text: `Please verify your email by clicking the link: ${verificationUrl}`,
    html: `<p>Please verify your email by clicking the link: <a href="${verificationUrl}">Verify Email</a></p>`
  };

  // Mailgun ile email gönderimi
  mg.messages.create(process.env.MAILGUN_DOMAIN || 'sandbox123.mailgun.org', emailData)
    .then(msg => console.log('Verification email sent:', msg))
    .catch(err => console.error('Error sending verification email:', err));
}