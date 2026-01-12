import express from "express";
import Author from "../../models/author.js";
import Book from "../../models/book.js";
import pool from "../../db/connection.js";

const apibookRouter = express.Router();

// Récupérer tous les livres avec informations des auteurs
apibookRouter.get("/", async (req, res) => {
	try {
		const books = await Book.findAllWithAuthors();

		console.table(books);
		res.status(200).json(books);
	} catch (error) {
		console.error("Erreur lors de la récupération des livres :", error);
		res.status(500).json({ message: "Impossible de récupérer les livres." });
	}
});

// Récupérer les livres disponibles
apibookRouter.get("/available/:id", async (req, res) => {
	try {
		const id = req.params.id;
		const books = await pool.query(
			`SELECT * FROM books WHERE available = true AND id = $1`,
			[id]
		);

		console.table(books.rows);
		res.status(200).json(books.rows);
	} catch (error) {
		console.error("Erreur lors de la récupération des livres :", error);
		res.status(500).json({ message: "Impossible de récupérer les livres." });
	}
});

// Créer un nouveau livre
apibookRouter.post("/", async (req, res) => {
	try {
		const { title, authorId, year } = req.body;

		if (!title || !authorId || !year)
			return res
				.status(400)
				.json({ message: "Champs obligatoires manquants :/" });

		const id = await Book.createBook(title, authorId, year);
		res.status(201).json({ id, title, authorId, year });
	} catch (error) {
		console.error("Erreur lors de la création du livre :", error);
		res.status(500).json({ error: "Failed to create book" });
	}
});

// Mettre à jour un livre
apibookRouter.put("/:id", async (req, res) => {
	try {
		const { title, year } = req.body;
		const id = req.params.id;

		if (!title || !year || !id)
			return res
				.status(400)
				.json({ message: "Champs obligatoires manquants :/" });

		const updatedBook = await Book.updateBook(title, year, id);

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
apibookRouter.delete("/:id", async (req, res) => {
	try {
		const id = req.params.id;

		if (!id)
			return res.status(400).json({
				message: "Aucune correspondance trouvé pour la suppression :/",
			});

		const result = await pool.query("DELETE FROM books WHERE id = $1", [id]);

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
apibookRouter.get("/all", async (req, res) => {
	try {
		const books = await Book.findAll();
		res.status(200).json(books);
	} catch (error) {
		console.error("Erreur lors de la récupération des livres :", error);
		res.status(500).json({ message: "Impossible de récupérer les livres." });
	}
});

// Récupérer un livre par son ID
apibookRouter.get("/:id", async (req, res) => {
	try {
		const id = req.params.id;
		const book = await Book.findById(id);

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
