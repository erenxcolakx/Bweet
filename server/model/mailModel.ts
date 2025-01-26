import jwt from 'jsonwebtoken';
import env from 'dotenv';
import formData from 'form-data';
import Mailgun from 'mailgun.js'; // Mailgun.js module
import { getVerificationEmailTemplate } from '../utils/emailTemplates';
import logger from '../config/logger'; // Import your logger

env.config();

export function generateVerificationToken(userId: number) {
  const secretKey = process.env.JWT_SECRET; // Ensure you have a secret key in your .env file
  if (!secretKey) {
    logger.error('JWT_SECRET is not defined in the environment variables'); // Log error if JWT_SECRET is missing
    throw new Error('JWT_SECRET is not defined in the environment variables');
  }

  try {
    const token = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
    logger.info(`Verification token generated for user ${userId}`); // Log token generation success
    return token;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error generating token for user ${userId}: ${error.message}`); // Log token generation failure
      throw error;
    }
  }
}

// Mailgun client setup
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '' // API key kontrolü ekleyelim
});

export function sendVerificationEmail(userEmail: string, token: string | undefined) {
  if (!process.env.MAILGUN_API_KEY) {
    logger.error('MAILGUN_API_KEY is missing');
    throw new Error('MAILGUN_API_KEY is missing');
  }

  if (!process.env.MAILGUN_DOMAIN) {
    logger.error('MAILGUN_DOMAIN is missing');
    throw new Error('MAILGUN_DOMAIN is missing');
  }

  logger.info(`Attempting to send verification email to: ${userEmail}`);
  logger.info(`Using Mailgun Domain: ${process.env.MAILGUN_DOMAIN}`);
  
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  // Email data setup
  const emailData = {
    from: `Bweet <bweetapp@gmail.com>`,
    to: userEmail,
    subject: 'Verify your email',
    text: `Please verify your email by clicking the link: ${verificationUrl}`,
    html: getVerificationEmailTemplate(verificationUrl)
  };

  // Sending email with Mailgun
  return mg.messages
    .create(process.env.MAILGUN_DOMAIN, emailData)
    .then(msg => {
      logger.info(`Verification email sent successfully to ${userEmail}`);
      logger.info(`Mailgun response: ${JSON.stringify(msg)}`);
      return true;
    })
    .catch(err => {
      logger.error(`Failed to send verification email to ${userEmail}`);
      logger.error(`Mailgun error: ${JSON.stringify(err)}`);
      throw err;
    });
}
