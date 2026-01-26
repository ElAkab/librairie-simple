import pool from "../db/connection.js";
import Book from "./book.js";
import type { Loan as LoanType } from "../db/database.js";

class Loan {
	static async findAll(
		limit: number = 6,
		offset: number = 0,
		filtered: string = "",
	): Promise<LoanType[]> {
		const query = `
        SELECT * FROM loans
        ${filtered ? "WHERE borrower_name ILIKE $3" : ""}
        LIMIT $1 OFFSET $2
    `;

		const params = filtered
			? [limit, offset, `%${filtered}%`]
			: [limit, offset];

		const result = await pool.query(query, params);
		return result.rows;
	}

	static async count(): Promise<number> {
		const result = await pool.query("SELECT COUNT(*) as count FROM loans");
		return parseInt(result.rows[0].count);
	}

	static async findById(id: number): Promise<LoanType | null> {
		const result = await pool.query("SELECT * FROM loans WHERE id = $1", [id]);
		return result.rows[0] ?? null;
	}

	static async createLoan(
		book_id: number,
		borrower_name: string,
		borrowed_date: string | null,
		return_date: string,
	): Promise<LoanType> {
		const result = await pool.query(
			"INSERT INTO loans (book_id, borrower_name, borrowed_date, return_date, loan_status) VALUES ($1, $2, $3, $4, 'active') RETURNING *",
			[book_id, borrower_name, borrowed_date, return_date],
		);

		// Mettre à jour la disponibilité du livre
		await Book.updateAvailability(book_id, false);

		return result.rows[0];
	}

	static async updateLoan(
		borrower_name: string,
		loan_status: string,
		return_date: string,
		id: number,
	): Promise<number | null> {
		const result = await pool.query(
			"UPDATE loans SET borrower_name = $1, loan_status = $2, return_date = $3 WHERE id = $4",
			[borrower_name, loan_status, return_date, id],
		);

		// Si le statut est 'returned', remettre le livre disponible
		if (loan_status === "returned") {
			const loan = await this.findById(id);
			if (loan) {
				await Book.updateAvailability(loan.book_id, true);
			}
		}

		return result.rowCount || null;
	}

	static async deleteById(id: number): Promise<number | null> {
		// Récupérer le loan avant de le supprimer pour remettre le livre disponible
		const loan = await this.findById(id);

		const result = await pool.query("DELETE FROM loans WHERE id = $1", [id]);

		// Remettre le livre disponible
		if (loan) {
			await Book.updateAvailability(loan.book_id, true);
		}

		return result.rowCount || null;
	}

	static async clear(): Promise<number | null> {
		const result = await pool.query("DELETE FROM loans");

		// Remettre tous les livres disponibles
		await pool.query("UPDATE books SET available = true");

		return result.rowCount || null;
	}
}

export default Loan;
