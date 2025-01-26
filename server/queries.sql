CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    password TEXT,
    google_id TEXT,
    is_verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE books (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT,
    author TEXT,
    cover_id INT,
    review TEXT,
    rating FLOAT,
    time TIMESTAMP WITH TIME ZONE,
    user_id UUID,
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    is_public BOOLEAN DEFAULT FALSE,
    cover_image BYTEA
);