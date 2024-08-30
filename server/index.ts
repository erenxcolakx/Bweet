import express from "express";
import router from "./routes/routes";
import session from 'express-session';
import env from 'dotenv'
import cors from 'cors';
env.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',  // Frontend uygulamanızın çalıştığı URL
  methods: 'GET,POST,PUT,DELETE',    // İzin verilen HTTP metodları
  credentials: true                  // Credential (cookie, authorization headers vb.) içeren istekleri kabul et
}));

if (!process.env.SECRET_KEY) {
  throw new Error("SECRET_KEY environment variable is not defined");
}

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

app.use(router);

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
