import express from "express";
import router from "./routes/routes.js";
import session from 'express-session';
import env from 'dotenv'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
env.config();

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

app.use(router);

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
