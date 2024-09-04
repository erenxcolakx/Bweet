/*You should create database named "book"*/
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE books (
    book_id SERIAL PRIMARY KEY,
    title TEXT,
    author TEXT,
    cover_id INT,
    review TEXT,
    rating FLOAT,
    time TIMESTAMP,
	user_id INT,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
);
