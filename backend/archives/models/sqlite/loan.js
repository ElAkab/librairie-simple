import db from "../../db/sqlite/connection.js";
import Book from "./book.js";

class Loan {
	// Création d'un emprunt
	static createLoan(bookId, borrowedName, borrowedDate, returnDate) {
		// Préparer la requête SQL pour une future insertion
		const stmt = db.prepare(`
            INSERT INTO loans (book_id, borrower_name, loan_status, borrowed_date, return_date)
            VALUES (?, ?, 'active', ?, ?)
        `);
		const result = stmt.run(bookId, borrowedName, borrowedDate, returnDate);

		// Marquer le livre comme non disponible
		Book.updateAvailability(bookId, false);

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
	static updateLoan(borrowerName, loan_status, returnDate, id) {
		// Récupérer l'emprunt pour obtenir le book_id
		const loan = this.findById(id);
		if (!loan) throw new Error("Emprunt introuvable");

		// Mettre à jour l'emprunt
		const stmt = db.prepare(`
            UPDATE loans
			SET borrower_name = ?,
				loan_status = ?,
				return_date = ?
			WHERE id = ?
        `);
		const result = stmt.run(borrowerName, loan_status, returnDate, id);

		// Synchroniser la disponibilité du livre
		if (loan_status === "returned") {
			// Si l'emprunt est retourné, le livre redevient disponible
			Book.updateAvailability(loan.book_id, true);
		} else if (loan_status === "active" || loan_status === "overdue") {
			// Si l'emprunt est actif ou en retard, le livre n'est pas disponible
			Book.updateAvailability(loan.book_id, false);
		}

		return result.changes;
	}

	// Supprimer un emprunt par son ID
	static deleteById(id) {
		const loan = this.findById(id);

		if (loan) {
			Book.updateAvailability(loan.book_id, true);
		}
		return db.prepare(`DELETE FROM loans WHERE id = ?`).run(id);
	}

	static clear() {
		return db.prepare(`DELETE FROM loans`).run();
	}
}
// NOT NULL
export default Loan;
