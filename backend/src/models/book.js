import pool from "../db/connection.js";

class Book {
	static async findAll() {
		const result = await pool.query("SELECT * FROM books");
		console.log(`📊 Books found: ${result.rows.length}`); // Debug
		return result.rows;
	}

	static async findAllWithAuthors() {
		const result = await pool.query(`
			SELECT books.*, 
				authors.full_name 
			FROM books 
			JOIN authors ON books.author_id = authors.id
			LIMIT 6
		`);
		return result.rows;
	}

	static async count() {
		const result = await pool.query("SELECT COUNT(*) as count FROM books");
		return parseInt(result.rows[0].count);
	}

	static async findById(id) {
		const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
		return result.rows[0] ?? null;
	}

	static async createBook(title, authorId, year) {
		const result = await pool.query(
			"INSERT INTO books (title, author_id, year) VALUES ($1, $2, $3) RETURNING id",
			[title, authorId, year]
		);
		return result.rows[0].id;
	}

	static async updateBook(title, year, id) {
		const result = await pool.query(
			"UPDATE books SET title = $1, year = $2 WHERE id = $3",
			[title, year, id]
		);
		return result.rowCount;
	}

	static async updateAvailability(bookId, available) {
		const result = await pool.query(
			"UPDATE books SET available = $1 WHERE id = $2",
			[available, bookId]
		);
		return result.rowCount;
	}
}

export default Book;
