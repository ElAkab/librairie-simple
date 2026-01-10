-- Supprimer les tables existantes pour recréer avec le bon schéma
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS authors CASCADE;

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    birth_year INTEGER
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
    available BOOLEAN DEFAULT true
);

CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    borrower_name VARCHAR(55) NOT NULL,
    borrowed_date DATE NOT NULL,
    return_date DATE,
    loan_status VARCHAR(20) DEFAULT 'active',
    CHECK (loan_status IN ('active', 'returned'))
);
