import Database from "better-sqlite3";
const db = new Database("app.db");

// Création du schéma "authors"
const createAuthorsTable = `
    CREATE TABLE IF NOT EXISTS authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        birth_year INTEGER,
        nationality TEXT
    )
`;

// Création du schéma "books"
const createBookTable = `
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        year INTEGER,
        available BOOLEAN DEFAULT 1,
        FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE,
        UNIQUE(title, author_id) -- Un livre unique par auteur
    )
`;

const createLoanTable = `
    CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        borrower_name TEXT,
        loan_status TEXT,
        borrowed_date DATE,
        return_date DATE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )
`;

db.exec(createAuthorsTable);
db.exec(createBookTable);
db.exec(createLoanTable);

export default db;
