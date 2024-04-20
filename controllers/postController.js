import * as postModel from '../model/model.js';

let posts = [];

export const getPosts = async (req, res) => {
  try {
    posts = await postModel.getAllBooks();
    res.render("index.ejs", { posts : posts });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
}

export const getBook = async (req,res) => {
  const title = req.query.title;
  const author = req.query.author;
  const coverId = req.query.coverId;
  res.render("addBook.ejs",{
    title: title,
    author: author,
    coverId : coverId
  });
}

export const addBook = async (req, res) => {
  const title = req.body.title;
  const author = req.body.author;
  const coverId = req.body.coverId;
  const review = req.body.review;
  const rating = parseFloat(req.body.rating);
  const time = new Date();

  const result = await postModel.addBook(title, author, coverId, review, rating, time);
  res.redirect("/");
}

export const updateBook = async (req, res) => {
  const bookId = req.body.id;
  const editedReview = req.body.editedReview.trim();
  const time = new Date();
  console.log(bookId,editedReview);
  try {
    const result = await postModel.updateBook(bookId, editedReview, time);
    res.redirect("/");
  } catch (error) {
    console.log("Review can't be edited", error);
    res.redirect("/");
  }
}

export const sortBooks = async (req, res) => {
  const sortType = req.body.sortType;
  try {
    const posts = await postModel.getSortedBooks(sortType);
    res.render("index.ejs", { posts: posts });
  } catch (error) {
    console.error("Error while sorting books:", error);
    res.redirect("/");
  }
}

export const deleteBook = async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await postModel.deleteBook(postId);;
    res.redirect("/");
  } catch (error) {
    res.redirect("/");
  }
}