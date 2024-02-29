CREATE TABLE movie (
    id SERIAL PRIMARY KEY,
    title  VARCHAR(255),
    release_date date,
    poster_path VARCHAR(500),
    overview VARCHAR(1000),
    comment VARCHAR(255)
);