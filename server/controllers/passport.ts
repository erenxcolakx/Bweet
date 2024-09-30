import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as authModel from '../model/model'; // User model dosyanız

// Google OAuth Strategy yapılandırması
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL:`http://localhost:4000/api/google/callback`,
},
async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
  try {
    // First, check if a user exists with the email from the Google profile
    let user = await authModel.getUserByEmail(profile.emails[0].value);

    // If a user exists with the same email, return the user
    if (user) {
      return done(null, user); // The email already exists, so we return the user
    }

    // If no user exists with the email, check if they signed up with Google before using the Google ID
    user = await authModel.getUserByGoogleId(profile.id);

    if (!user) {
      // If the user doesn't exist with the Google ID, create a new user
      user = await authModel.createUserWithGoogle(profile.id, profile.displayName, profile.emails[0].value);
    }

    return done(null, user); // Return the new or existing user
  } catch (error) {
    return done(error, null);  // Return error if something goes wrong
  }
}));

// Kullanıcıyı session'da saklamak için serialize
passport.serializeUser((user: any, done) => {
  console.log("user serialize" , user)
  done(null, user.user_id);
});

// Session'dan kullanıcıyı geri almak için deserialize
passport.deserializeUser(async (id: string, done) => {
  try {
    console.log("user deserialize" , id)
    const user = await authModel.getUserById(Number(id));
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
