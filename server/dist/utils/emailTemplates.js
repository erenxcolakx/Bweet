"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerificationEmailTemplate = void 0;
const getVerificationEmailTemplate = (verificationUrl) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="text-align: center; color: #333;">Welcome to <span style="font-style: italic">Bweet!</span></h2>
    <p style="font-size: 16px; color: #555;">
      Thank you for registering with Bweet! To complete your registration, please verify your email by clicking the link below.
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
    </div>
    <p style="font-size: 14px; color: #555;">
      If you didn’t request this email, please ignore it.
    </p>
    <p style="font-size: 14px; color: #555;">Thanks, <br/> The Bweet Team</p>
  </div>
`;
exports.getVerificationEmailTemplate = getVerificationEmailTemplate;
