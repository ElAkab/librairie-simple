import pool from "../db/connection.js";
import Book from "./book.js";

class Loan {
	static async findAll() {
		const result = await pool.query("SELECT * FROM loans");
		return result.rows;
	}

	static async count() {
		const result = await pool.query("SELECT COUNT(*) as count FROM loans");
		return parseInt(result.rows[0].count);
	}

	static async findById(id) {
		const result = await pool.query("SELECT * FROM loans WHERE id = $1", [id]);
		return result.rows[0] ?? null;
	}

	static async createLoan(book_id, borrower_name, borrowed_date, return_date) {
		const result = await pool.query(
			"INSERT INTO loans (book_id, borrower_name, borrowed_date, return_date, loan_status) VALUES ($1, $2, $3, $4, 'active') RETURNING *",
			[book_id, borrower_name, borrowed_date, return_date]
		);
		
		// Mettre à jour la disponibilité du livre
		await Book.updateAvailability(book_id, false);
		
		return result.rows[0];
	}

	static async updateLoan(borrower_name, loan_status, return_date, id) {
		const result = await pool.query(
			"UPDATE loans SET borrower_name = $1, loan_status = $2, return_date = $3 WHERE id = $4",
			[borrower_name, loan_status, return_date, id]
		);
		
		// Si le statut est 'returned', remettre le livre disponible
		if (loan_status === 'returned') {
			const loan = await this.findById(id);
			if (loan) {
				await Book.updateAvailability(loan.book_id, true);
			}
		}
		
		return result.rowCount;
	}

	static async deleteById(id) {
		// Récupérer le loan avant de le supprimer pour remettre le livre disponible
		const loan = await this.findById(id);
		
		const result = await pool.query("DELETE FROM loans WHERE id = $1", [id]);
		
		// Remettre le livre disponible
		if (loan) {
			await Book.updateAvailability(loan.book_id, true);
		}
		
		return result.rowCount;
	}

	static async clear() {
		const result = await pool.query("DELETE FROM loans");
		
		// Remettre tous les livres disponibles
		await pool.query("UPDATE books SET available = true");
		
		return result.rowCount;
	}
}

export default Loan;
