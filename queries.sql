/*You should create database named "book"*/
CREATE TABLE posts (
	id SERIAL PRIMARY KEY,
	title TEXT,
	author TEXT,
	cover_id INT,
	review TEXT,
	rating FLOAT,
	time TIMESTAMP
);