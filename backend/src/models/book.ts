import pool from "../db/connection.js";
import type { Book as BookType } from "../db/database.js";

class Book {
	static async findAll(): Promise<BookType[]> {
		const result = await pool.query("SELECT * FROM books");
		console.log(`📊 Books found: ${result.rows.length}`); // Debug
		return result.rows;
	}

	static async findAllWithAuthors(
		limit: number = 6,
		offset: number = 0,
		filtered: string,
	): Promise<BookType[]> {
		const query = `
			SELECT books.*, authors.full_name 
			FROM books 
			JOIN authors ON books.author_id = authors.id
			${filtered ? "WHERE books.title ILIKE $3 OR authors.full_name ILIKE $4" : ""}
			LIMIT $1 OFFSET $2
		`;

		const params = filtered
			? [limit, offset, `%${filtered}%`, `%${filtered}%`]
			: [limit, offset];

		const result = await pool.query(query, params);
		return result.rows;
	}

	static async count(): Promise<number> {
		const result = await pool.query("SELECT COUNT(*) as count FROM books");
		return parseInt(result.rows[0].count);
	}

	static async findById(id: number): Promise<BookType | null> {
		const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
		return result.rows[0] ?? null;
	}

	static async createBook(
		title: string,
		authorId: number,
		year: number,
	): Promise<number> {
		const result = await pool.query(
			"INSERT INTO books (title, author_id, year) VALUES ($1, $2, $3) RETURNING id",
			[title, authorId, year],
		);
		return result.rows[0].id;
	}

	static async updateBook(
		title: string,
		year: number,
		id: number,
	): Promise<number | null> {
		const result = await pool.query(
			"UPDATE books SET title = $1, year = $2 WHERE id = $3",
			[title, year, id],
		);

		return result.rowCount || null;
	}

	static async updateAvailability(bookId: number, available: boolean) {
		const result = await pool.query(
			"UPDATE books SET available = $1 WHERE id = $2",
			[available, bookId],
		);
		return result.rowCount || null;
	}
}

export default Book;
