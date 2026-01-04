import express from "express";
import Book from "../models/book.js";
import { deleteBookWithLoans } from "../commands/query.js";

const bookRouter = express.Router();

// Récupérer tous les livres
bookRouter.get("/", (req, res) => {
	try {
		const table = Book.findAll();

		console.table(table);
		res.status(200).json(table);
	} catch (error) {
		console.error("Erreur lors de la récupération des livres :", error);
		res.status(500).json({ message: "Impossible de récupérer les livres." });
	}
});

// Créer un nouveau livre
bookRouter.post("/", (req, res) => {
	try {
		const { title, authorId, year } = req.body;

		if (!title || !authorId || !year)
			return res
				.status(400)
				.json({ message: "Champs obligatoires manquants :/" }); // ? Erreur 400 = Bad Request

		const id = Book.createBook(title, authorId, year);
		res.status(201).json({ id, title, authorId, year });
	} catch (error) {
		console.error("Erreur lors de la création du livre :", error);
		res.status(500).json({ error: "Failed to create book" });
	}
});

// Mettre à jour un livr
bookRouter.put("/:id", (req, res) => {
	try {
		const { title, year } = req.body;
		const id = req.params.id;

		if (!title || !year || !id)
			return res
				.status(400)
				.json({ message: "Champs obligatoires manquants :/" });

		const updated = Book.updateBook(title, year, id);

		res.status(200).json({
			message: "Book updated successfully",
			changes: `Nombre de lignes modifiées: ${updated}`,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du livre :", error);

		res.status(500).json({ message: "Impossible de mettre à jour le livre." });
	}
});

// Supprimer un livre et ses emprunts associés
bookRouter.delete("/:id", (req, res) => {
	try {
		const id = req.params.id;

		if (!id)
			return res.status(400).json({
				message: "Aucune correspondance trouvé pour la suppression :/",
			});

		const action = deleteBookWithLoans(id);
		res.status(200).json({
			message: "Livre et ses emprunts supprimés avec succès.",
			action: action,
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du livre :", error);
		res.status(500).json({ message: "Impossible de supprimer le livre." });
	}
});

// Récupérer tous les livres
bookRouter.get("/all", (req, res) => {
	try {
		const books = Book.findAll();
		res.status(200).json(books);
	} catch (error) {
		console.error("Erreur lors de la récupération des livres :", error);
		res.status(500).json({ message: "Impossible de récupérer les livres." });
	}
});

// Récupérer un livre par son ID
bookRouter.get("/:id", (req, res) => {
	try {
		const id = req.params.id;
		const book = Book.findById(id);
		if (!book) {
			return res.status(404).json({ error: "Book not found" });
		}

		res.status(200).json(book);
	} catch (error) {
		console.error("Erreur lors de la récupération du livre :", error);
		res.status(500).json({ message: "Impossible de récupérer le livre." });
	}
});

export default bookRouter;
