// import Author from "./models/author.js";
import Book from "./models/book.js";
import db from "./db/connection.js";
import { seedDatabase } from "./db/seeds/seed.js";
import { findAvailableBooks, findOverdueLoans } from "./commands/query.js";

console.log("=== Gestion de bibliothèque ===");

// if (Book.count() === 0) seedDatabase();

const availableBooks = findAvailableBooks();
const overdueLoans = findOverdueLoans();

// console.log("\nLivres :");
// console.table(db.prepare("SELECT * FROM books").all());

// console.log("\nAuteurs :");
// console.table(db.prepare("SELECT * FROM authors").all());

// console.log("\nEmprunts :");
// console.table(db.prepare("SELECT * FROM loans").all());

// Afficher les emprunts en cours
// console.table(
// 	db
// 		.prepare(
// 			`SELECT loans.borrower_name, loans.return_date, authors.nationality
//     FROM loans
//     JOIN books ON loans.book_id = books.id
//     JOIN authors ON books.author_id = authors.id
//     WHERE return_date IS NOT null
// `
// 		)
// 		.all()
// );
