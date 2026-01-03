import Author from "../models/author.js";
import Book from "../models/book.js";
import db from "../db/connection.js";

// Requête personnalisée SQL
export function customQuery(sql) {
	try {
		const result = db.prepare(sql).all();
		console.table(result);
		return result;
	} catch (err) {
		console.error("Erreur lors de l'exécution de la requête :", err.message);
		throw err;
	}
}

export function findAvailableBooks() {
	try {
		const result = db
			.prepare(
				`SELECT books.title, authors.firstName, authors.lastName, books.year
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
	} catch (err) {
		console.error(
			"Erreur lors de la recherche des livres disponibles :",
			err.message
		);
		throw err;
	}
}

export function findOverdueLoans() {
	try {
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
	} catch (err) {
		console.error(
			"Erreur lors de la recherche des emprunts en retard :",
			err.message
		);
		throw err;
	}
}

export function findBooksByAuthor(authorId) {
	try {
		const result = db
			.prepare(
				`
			SELECT books.title, books.year, COUNT(loans.id) AS loan_count
			FROM books
			LEFT JOIN loans ON books.id = loans.book_id
			WHERE books.author_id = ?
			GROUP BY books.id
			`
			)
			.all(authorId);

		console.log(`Livres de l'auteur ID ${authorId}`);
		console.table(result);
		return result;
	} catch (err) {
		console.error(
			"Erreur lors de la recherche des livres par auteur :",
			err.message
		);
		throw err;
	}
}

// Supprimer un auteur, tous ses livres ET les emprunts des livres en une transaction atomique. Tester le rollback en cas d'erreur.
export function deleteAuthorWithBooks(authorId) {
	try {
		const authorName = db
			.prepare("SELECT firstName, lastName FROM authors WHERE id = ?")
			.get(authorId);
		const stmt = db.prepare(`
		DELETE FROM	authors
		WHERE id = ?
	`);
		const result = stmt.run(authorId);
		console.log(
			`Auteur ${authorName.firstName} ${authorName.lastName} et tous ses livres ont été supprimés.`
		);
		if (result.changes === 0) {
			throw new Error("Aucun auteur trouvé avec cet ID.");
		}
		return result;
	} catch (err) {
		console.error("Erreur lors de la suppression de l'auteur :", err.message);
		throw err;
	}
}

// Supprimer un livre et tous ses emprunts en une transaction atomique. Tester le rollback en cas d'erreur.
export function deleteBookWithLoans(bookId) {
	try {
		const book = db.prepare("SELECT title FROM books WHERE id = ?").get(bookId);

		if (!book) {
			console.log(`Aucun livre trouvé avec l'ID ${bookId}`);
			return null;
		}

		// Compter les emprunts avant suppression
		const loanCount = db
			.prepare("SELECT COUNT(*) as count FROM loans WHERE book_id = ?")
			.get(bookId).count;

		const result = db.prepare("DELETE FROM books WHERE id = ?").run(bookId);

		console.log(`✅ Suppression CASCADE réussie :`);
		console.log(`   - 1 livre: ${book.title}`);
		console.log(`   - ${loanCount} emprunt(s)`);

		return result;
	} catch (err) {
		console.error("Erreur lors de la suppression du livre :", err.message);
		throw err;
	}
}
