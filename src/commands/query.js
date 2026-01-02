import Author from "../models/author.js";
import Book from "../models/book.js";
import db from "../db/connection.js";

/**
 * Commandes pour LIRE les données (SELECT)
 */

// 📚 Afficher tous les livres
export function showAllBooks() {
	const books = Book.findAll();
	console.table(books);
	return books;
}

// 👤 Afficher tous les auteurs
export function showAllAuthors() {
	const authors = Author.findAll();
	console.table(authors);
	return authors;
}

// 🔍 Chercher un livre par ID
export function findBook(id) {
	const book = Book.findById(id);
	console.table(book);
	return book;
}

// 🔍 Chercher un auteur par ID
export function findAuthor(id) {
	const author = Author.findById(id);
	console.table(author);
	return author;
}

// 📊 Requête personnalisée SQL
export function customQuery(sql) {
	const result = db.prepare(sql).all();
	console.table(result);
	return result;
}

// 📝 EXEMPLE D'UTILISATION (décommenter pour tester)
// showAllBooks();
// showAllAuthors();
// findBook(1);
// customQuery("SELECT * FROM books WHERE year > 2000");

export function findAvailableBooks() {
	const result = db
		.prepare(
			`SELECT books.title, authors.firstName, authors.lastName
	FROM books
	JOIN authors ON books.author_id = authors.id
	LEFT JOIN loans ON books.id = loans.book_id
	WHERE loans.return_date IS NOT NULL OR loans.return_date IS NULL
`
		)
		.all();
	console.log("Livres disponible");
	console.table(result);
	return result;
}

export function findOverdueLoans() {
	const result = db
		.prepare(
			`SELECT loans.borrower_name, loans.return_date, books.title
	FROM loans
	JOIN books ON loans.book_id = books.id
	WHERE loans.return_date < DATE('now')
`
		)
		.all();
	console.log("Livres toujours emprunté");
	console.table(result);
	return result;
}
