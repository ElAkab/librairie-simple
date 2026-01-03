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
		return db.prepare(`SELECT * FROM loans`).all(); // .all() pour plusieurs résultats
	}

	// Trouver un emprunt par son ID
	static findById(id) {
		return db.prepare(`SELECT * FROM loans WHERE id = ?`).get(id);
	}

	// Mettre à jour un livre par son ID
	static updateLoan(bookId, borrowerName, borrowedDate, returnDate, id) {
		const stmt = db.prepare(`
            UPDATE loans
            SET book_id = ?, 
                borrower_name = ?, 
                borrowed_date= ? 
                return_date = ?
            WHERE id = ?
        `);
		const result = stmt.run(bookId, borrowerName, borrowedDate, returnDate, id);
		return result.changes;
	}
}

export default Loan;
