import db from "../db/connection.js";
// import { seedDatabase } from "../db/seeds/seed.js";

// Supprimer toutes les données
db.exec("DELETE FROM books");
db.exec("DELETE FROM authors");

// Réinitialiser les compteurs auto-increment
db.exec("DELETE FROM sqlite_sequence WHERE name='books'");
db.exec("DELETE FROM sqlite_sequence WHERE name='authors'");

console.log("🗑️  Database cleared");
console.table({
	books: db.prepare("SELECT * FROM books").all(),
	authors: db.prepare("SELECT * FROM authors").all(),
});

// Repeupler
// seedDatabase();
