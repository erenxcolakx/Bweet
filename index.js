import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE ,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let posts = [];

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM posts");
    posts = result.rows;
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
  res.render("index.ejs",{
    posts : posts
  });
});

app.get("/book" , (req,res) => {
  const title = req.query.title;
  const author = req.query.author;
  const coverId = req.query.coverId;
  res.render("addBook.ejs",{
    title: title,
    author: author,
    coverId : coverId
  })
});

app.post('/submit', async (req, res) => {
  const title = req.body.title;
  const author = req.body.author;
  const coverId = req.body.coverId;
  const review = req.body.review;
  const rating = parseFloat(req.body.rating);
  const time = new Date();

  try {
    const result = db.query('INSERT INTO posts (title, author, cover_id, review, rating, time) VALUES ($1, $2, $3, $4, $5, $6)', [title, author, coverId, review, rating, time]);
  } catch (error) {
    console.log(error);
  }
  res.redirect("/")
});

app.post('/edit', async (req, res) => {
  const bookId = req.body.id;
  const editedReview = req.body.editedReview.trim();
  const time = new Date();
  console.log(bookId,editedReview);
  try {
    await db.query(`UPDATE posts SET review = $1, time = $2 WHERE id = $3`, [editedReview, time, bookId]);
    res.redirect("/");
  } catch (error) {
    console.log("Review can't be edited");
    res.redirect("/");
  }
});

app.post('/sort', async (req, res) => {
  const sortType = req.body.sortType;
  switch (sortType) {
    case "htl":
      // Rating - High-to-Low
      try {
        let sortedBooks = await db.query(`SELECT * FROM posts ORDER BY rating DESC`);
        posts = sortedBooks.rows;
        res.render("index.ejs", {
          posts: posts
        });
      } catch (error) {
        console.log("Error while sorting htl");
        res.redirect("/");
      }
      break;
    case "lth":
      // Rating - Low-to-High
      try {
        let sortedBooks = await db.query(`SELECT * FROM posts ORDER BY rating ASC`);
        posts = sortedBooks.rows;
        res.render("index.ejs", {
          posts: posts
        });
      } catch (error) {
        console.log("Error while sorting lth");
        res.redirect("/");
      }
      break;
    case "rto":
      // Time - Recent to oldest
      try {
        let sortedBooks = await db.query(`SELECT * FROM posts ORDER BY time DESC`);
        posts = sortedBooks.rows;
        res.render("index.ejs", {
          posts: posts
        });
      } catch (error) {
        console.log("Error while sorting rto");
        res.redirect("/");
      }
      break;
    case "otr":
      // Time - Oldest to recent
      try {
        let sortedBooks = await db.query(`SELECT * FROM posts ORDER BY rating ASC`);
        posts = sortedBooks.rows;
        res.render("index.ejs", {
          posts: posts
        });
      } catch (error) {
        console.log("Error while sorting otr");
        res.redirect("/");
      }
      break;
    default:
      res.redirect("/");
      break;
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
