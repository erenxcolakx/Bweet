"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVerificationToken = generateVerificationToken;
exports.sendVerificationEmail = sendVerificationEmail;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const form_data_1 = __importDefault(require("form-data"));
const mailgun_js_1 = __importDefault(require("mailgun.js")); // Mailgun.js module
const emailTemplates_1 = require("../utils/emailTemplates");
const logger_1 = __importDefault(require("../config/logger")); // Import your logger
dotenv_1.default.config();
function generateVerificationToken(userId) {
    const secretKey = process.env.JWT_SECRET; // Ensure you have a secret key in your .env file
    if (!secretKey) {
        logger_1.default.error('JWT_SECRET is not defined in the environment variables'); // Log error if JWT_SECRET is missing
        throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    try {
        const token = jsonwebtoken_1.default.sign({ userId }, secretKey, { expiresIn: '1h' });
        logger_1.default.info(`Verification token generated for user ${userId}`); // Log token generation success
        return token;
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.default.error(`Error generating token for user ${userId}: ${error.message}`); // Log token generation failure
            throw error;
        }
    }
}
// Mailgun client setup
const mailgun = new mailgun_js_1.default(form_data_1.default);
const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere' });
function sendVerificationEmail(userEmail, token) {
    const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;
    // Email data setup
    const emailData = {
        from: 'Bweet <bweetapp@gmail.com>',
        to: userEmail,
        subject: 'Verify your email',
        text: `Please verify your email by clicking the link: ${verificationUrl}`,
        html: (0, emailTemplates_1.getVerificationEmailTemplate)(verificationUrl)
    };
    // Sending email with Mailgun
    mg.messages.create(process.env.MAILGUN_DOMAIN || 'sandbox123.mailgun.org', emailData)
        .then(msg => {
        logger_1.default.info(`Verification email sent to ${userEmail}: ${msg}`); // Log email sending success
    })
        .catch(err => {
        logger_1.default.error(`Error sending verification email to ${userEmail}: ${err}`); // Log email sending failure
    });
}
