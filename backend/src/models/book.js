import db from "../db/connection.js";

class Book {
	// Création d'un livre
	static createBook(title, authorId, year) {
		// Préparer la requête SQL pour une future insertion
		const stmt = db.prepare(`
            INSERT INTO books (title, author_id, year) VALUES (?, ?, ?)
        `);

		// Exécuter la requête avec les valeurs fournies
		const newBook = stmt.run(title, authorId, year);
		return newBook.lastInsertRowid; // Retourner l'ID du nouveau livre car
	}

	// Récupérer tous les livres
	static findAll() {
		return db.prepare(`SELECT * FROM books`).all();
	}

	// Trouver un livre par son ID
	static findById(id) {
		return db.prepare(`SELECT * FROM books WHERE id = ?`).get(id);
	}

	// Mettre à jour un livre par son ID
	static updateBook(title, year, id) {
		const stmt = db.prepare(`
			UPDATE books
			SET title = ?, year = ?
			WHERE id = ?
		`);
		const result = stmt.run(title, year, id);
		return result.changes;
	}

	// Supprimer un livre par son ID
	static deleteById(id) {
		return db.prepare(`DELETE FROM books WHERE id = ?`).run(id);
	}

	// Compter le nombre de livres
	static count() {
		return db.prepare("SELECT COUNT(*) as total FROM books").get().total;
	}

	// Mettre à jour la disponibilité d'un livre
	static updateAvailability(bookId, available) {
		const stmt = db.prepare(`
			UPDATE books
			SET available = ?
			WHERE id = ?
		`);
		const result = stmt.run(available ? 1 : 0, bookId);
		return result.changes;
	}
}

export default Book;

// console.table(Book.findAll());
// console.table(Book.count());
// console.table(Book.findById(37));
// console.table(Book.create("Harry Potter", "J.K. Rowling", 1997));
