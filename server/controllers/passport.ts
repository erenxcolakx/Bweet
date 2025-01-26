import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as authModel from '../model/model'; // User model
import logger from '../config/logger'; // Import logger

const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = isProduction ? process.env.BASE_URL : 'http://localhost:4000';

// Google OAuth Strategy configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${baseUrl}/api/google/callback`,
},
  async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
    try {
      logger.info(`Google OAuth login attempt for profile: ${profile.emails[0].value}`);

      // Check if a user exists with the email from the Google profile
      let user = await authModel.getUserByEmail(profile.emails[0].value);

      if (user) {
        logger.info(`User found with email: ${profile.emails[0].value}`);
        return done(null, user);  // Return the user if the email already exists
      }

      // Check if the user signed up with Google before using the Google ID
      user = await authModel.getUserByGoogleId(profile.id);

      if (!user) {
        // If no user exists, create a new user
        logger.info(`No user found with Google ID: ${profile.id}. Creating new user.`);
        user = await authModel.createUserWithGoogle(profile.id, profile.displayName, profile.emails[0].value);
      }

      if (user) {
        logger.info(`User authenticated successfully: ${user.email}`);
      }
      return done(null, user);  // Return the new or existing user

    } catch (error: unknown) {
      // Type assertion for error
      if (error instanceof Error) {
        logger.error(`Error during Google OAuth: ${error.message}`);
        return done(error, null);  // Return the error if something goes wrong
      } else {
        logger.error('Unknown error during Google OAuth');
        return done(new Error('Unknown error'), null);
      }
    }
  }
));

// Serialize user for session storage
passport.serializeUser((user: any, done) => {
  logger.info(`Serializing user: ${user.email}`);
  done(null, user.user_id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    logger.info(`Deserializing user with ID: ${id}`);
    const user = await authModel.getUserById(Number(id));
    logger.info(`User deserialized: ${user.email}`);
    done(null, user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error deserializing user: ${error.message}`);
      done(error, null);
    } else {
      logger.error('Unknown error during deserialization');
      done(new Error('Unknown error'), null);
    }
  }
});

export default passport;
