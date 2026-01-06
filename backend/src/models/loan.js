import db from "../db/connection.js";

class Loan {
	// Création d'un livre
	static createLoan(bookId, borrowedName, borrowedDate, returnDate) {
		// Préparer la requête SQL pour une future insertion
		const stmt = db.prepare(`
            INSERT INTO loans (book_id, borrower_name, borrowed_date, return_date)
            VALUES (?, ?, ?, ?)
        `);
		const result = stmt.run(bookId, borrowedName, borrowedDate, returnDate);
		return result.lastInsertRowid;
	}

	// Récupérer tous les emprunts
	static findAll() {
		return db.prepare(`SELECT * FROM loans LIMIT 6`).all(); // .all() pour plusieurs résultats
	}

	// Trouver un emprunt par son ID
	static findById(id) {
		return db.prepare(`SELECT * FROM loans WHERE id = ?`).get(id);
	}

	// Mettre à jour un emprunt (modifier : borrower_name, borrowed_date, return_date) par son ID
	static updateLoan(borrowerName, borrowedDate, returnDate, id) {
		const stmt = db.prepare(`
            UPDATE loans
			SET borrower_name = ?,
				borrowed_date = ?,
				return_date = ?
			WHERE id = ?
        `);
		const result = stmt.run(borrowerName, borrowedDate, returnDate, id);
		return result.changes;
	}

	// Supprimer un emprunt par son ID
	static deleteById(id) {
		return db.prepare(`DELETE FROM loans WHERE id = ?`).run(id);
	}

	static clear() {
		return db.prepare(`DELETE FROM loans`).run();
	}
}
// NOT NULL
export default Loan;
