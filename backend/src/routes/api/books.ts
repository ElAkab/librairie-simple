import express from "express";
import Author from "../../models/author.js";
import Book from "../../models/book.js";
import pool from "../../db/connection.js";
import type { Request, Response } from "express";

const apibookRouter = express.Router();

type BookQuery = {
	page?: string;
	limit?: string;
	searched?: string;
};

// Récupérer tous les livres avec informations des auteurs
// curl http://localhost:4000/api/books?page=1&limit=6
apibookRouter.get(
	"/",
	async (req: Request<{}, unknown, {}, BookQuery>, res: Response) => {
		try {
			console.log("Query params:", req.query); // Debug

			const page: number = Number(req.query.page) || 1;
			const limit: number = Number(req.query.limit) || 6;
			const searched: string = req.query.searched || "";
			const offset: number = (page - 1) * limit;

			const allBooks = await Book.findAllWithAuthors(limit, offset, searched);
			const total = await Book.count();

			console.table(allBooks);
			res.status(200).json({
				data: allBooks,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit), // Total des pages (arrondi supérieur et division par limit)
				},
			});
		} catch (error) {
			console.error("Erreur lors de la récupération des livres :", error);
			res.status(500).json({ message: "Impossible de récupérer les livres." });
		}
	},
);

// Récupérer les livres disponibles
apibookRouter.get("/available/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const books = await pool.query(
			`SELECT * FROM books WHERE available = true AND id = $1`,
			[Number(id)],
		);

		console.table(books.rows);
		res.status(200).json(books.rows);
	} catch (error) {
		console.error("Erreur lors de la récupération des livres :", error);
		res.status(500).json({ message: "Impossible de récupérer les livres." });
	}
});

// Créer un nouveau livre
apibookRouter.post("/", async (req: Request, res: Response) => {
	try {
		const { title, authorId, year } = req.body;

		if (!title || !authorId || !year)
			return res
				.status(400)
				.json({ message: "Champs obligatoires manquants :/" });

		const id = await Book.createBook(title, Number(authorId), Number(year));
		res.status(201).json({ id, title, authorId, year });
	} catch (error) {
		console.error("Erreur lors de la création du livre :", error);
		res.status(500).json({ error: "Failed to create book" });
	}
});

// Mettre à jour un livre
apibookRouter.put("/:id", async (req: Request, res: Response) => {
	try {
		const { title, year } = req.body;
		const { id } = req.params;

		if (!title || !year || !id)
			return res
				.status(400)
				.json({ message: "Champs obligatoires manquants :/" });

		const updatedBook = await Book.updateBook(title, year, Number(id));

		res.status(200).json({
			message: "Book updated successfully",
			changes: `Nombre de lignes modifiées: ${updatedBook}`,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du livre :", error);

		res.status(500).json({ message: "Impossible de mettre à jour le livre." });
	}
});

// Supprimer un livre (cascade delete des loans grâce au schéma)
apibookRouter.delete("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		if (!id)
			return res.status(400).json({
				message: "Aucune correspondance trouvé pour la suppression :/",
			});

		const result = await pool.query("DELETE FROM books WHERE id = $1", [
			Number(id),
		]);

		res.status(200).json({
			message: "Livre et ses emprunts supprimés avec succès.",
			changes: result.rowCount,
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du livre :", error);
		res.status(500).json({ message: "Impossible de supprimer le livre." });
	}
});

// Récupérer tous les livres (endpoint alternatif)
apibookRouter.get("/all", async (req: Request, res: Response) => {
	try {
		const books = await Book.findAll();
		res.status(200).json(books);
	} catch (error) {
		console.error("Erreur lors de la récupération des livres :", error);
		res.status(500).json({ message: "Impossible de récupérer les livres." });
	}
});

// Récupérer un livre par son ID
apibookRouter.get("/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const book = await Book.findById(Number(id));

		if (!book) {
			return res.status(404).json({ error: "Book not found" });
		}

		res.status(200).json(book);
	} catch (error) {
		console.error("Erreur lors de la récupération du livre :", error);
		res.status(500).json({ message: "Impossible de récupérer le livre." });
	}
});

export default apibookRouter;
