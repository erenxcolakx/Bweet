import * as postModel from '../model/model.js';

export const homepage = async (req, res) => {
  try {
    res.render('homepage.ejs');
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
}

export const getPosts = async (req, res) => {
  try {
    const userId = req.session.user.user_id;
    let posts = await postModel.getAllBooks(userId);
    res.render("index.ejs", { posts : posts, user: req.session.user.email});
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
    coverId : coverId,
    user: req.session.user.email
  });
}

export const addBook = async (req, res) => {
  const title = req.body.title;
  const author = req.body.author;
  const coverId = req.body.coverId;
  const review = req.body.review;
  const rating = parseFloat(req.body.rating);
  const time = new Date();
  const userId = req.session.user.user_id;

  const result = await postModel.addBook(title, author, coverId, review, rating, time, userId);
  res.redirect("/books");
}

export const updateBook = async (req, res) => {
  const bookId = req.body.id;
  const editedReview = req.body.editedReview.trim();
  const time = new Date();
  const userId = req.session.user.user_id;
  console.log(bookId,editedReview);
  try {
    const result = await postModel.updateBook(bookId, editedReview, time, userId);
    res.redirect("/books");
  } catch (error) {
    console.log("Review can't be edited", error);
    res.redirect("/books");
  }
}

export const sortBooks = async (req, res) => {
  const sortType = req.body.sortType;
  const userId = req.session.user.user_id;
  try {
    const posts = await postModel.getSortedBooks(sortType,userId);
    res.render("index.ejs", { posts: posts });
  } catch (error) {
    console.error("Error while sorting books:", error);
    res.redirect("/books");
  }
}

export const deleteBook = async (req, res) => {
  const postId = req.params.id;
  const userId = req.session.user.user_id;
  try {
    const result = await postModel.deleteBook(postId, userId);
    res.redirect("/books");
  } catch (error) {
    res.redirect("/books");
  }
}