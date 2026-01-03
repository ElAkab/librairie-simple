// import Author from "./models/author.js";
import Book from "./models/book.js";
import db from "./db/connection.js";
import { seedDatabase } from "./db/seeds/seed.js";
import {
	findAvailableBooks,
	findOverdueLoans,
	findBooksByAuthor,
	deleteAuthorWithBooks,
} from "./commands/query.js";

console.log("=== Gestion de bibliothèque ===");

if (Book.count() === 0) seedDatabase();

// Récupérer et afficher les livres disponibles
// findAvailableBooks();

// Récupérer et afficher les emprunts en retard
// findOverdueLoans();

findBooksByAuthor(5);

// =============================================
// Pour vérifier le contenu de la base de données après le seed
// =============================================
// console.log("\nLivres :");
// console.table(db.prepare("SELECT * FROM books").all());

// console.log("\nAuteurs :");
// console.table(db.prepare("SELECT * FROM authors").all());

// console.log("\nEmprunts :");
// console.table(db.prepare("SELECT * FROM loans").all());

// Trouver les livres d'un auteur spécifique (ici auteur ID 3)
// findBooksByAuthor(3);

// Test de suppression en cascade
// deleteAuthorWithBooks(3);
