-- Supprimer les tables existantes pour recréer avec le bon schéma
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS authors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS authors (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50) NOT NULL,
    birth_year INTEGER
);

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
    available BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    borrower_name VARCHAR(55) NOT NULL,
    borrowed_date DATE NOT NULL,
    return_date DATE,
    loan_status VARCHAR(20) DEFAULT 'active',
    CHECK (loan_status IN ('active', 'returned'))
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    CHECK (role IN ('user', 'admin'))
);