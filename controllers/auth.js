import express from "express";
import session from 'express-session';
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import * as postModel from '../model/model.js';
import env from 'dotenv'

const app = express();
const port = 4000;
const saltRounds = 10;
env.config();

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
  }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
  });

export const renderLogin = (req, res) =>{
    const error = req.query.error;
    res.render("login.ejs", { error: error });
  }

export const renderRegister = (req, res) => {
    const error = req.query.error;
    res.render("register.ejs", { error: error });
  };

export const handleLogin = async (req, res) => {
    const email = req.body.username;
    const loginPassword = req.body.password;

    try {
        const result = await postModel.getUserByEmail(email);
        if (result) {
            const user = result;
            const storedHashedPassword = user.password;

            const isMatch = await bcrypt.compare(loginPassword, storedHashedPassword);
            if (isMatch) {
                console.log(user, req.session)
                req.session.user = user; // Kullanıcı bilgilerini session'a kaydet
                res.redirect('/books');
            } else {
                res.redirect('/login?error=Incorrect%20Password');
            }
        } else {
            res.redirect('/login?error=User%20not%20found');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/login?error=Internal%20server%20error');
    }
};
  // Handle register
export const handleRegister = async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    try {
      const user = await postModel.getUserByEmail(email);

      if (user) {
        res.redirect('/login?error=Email%20already%20exists.%20Try%20logging%20in.');
      } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.log("Error hashing password", err);
            res.status(500).send("Internal server error");
          } else {
            await postModel.createUser(email, hash);
            res.redirect('/login');
          }
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal server error");
    }
  };

// Handle logout
export const handleLogout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log("Error destroying session: " + err);
        res.redirect('/books');
      } else {
        res.redirect('/');
      }
    });
};

export const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.user_id) {
      next();
    } else {
      res.redirect('/login?error=You%20must%20be%20logged%20in%20to%20view%20this%20page');
    }
};

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
