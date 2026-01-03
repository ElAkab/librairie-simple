import express from "express";
import Book from "../models/book.js";

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

bookRouter.get("/all", (req, res) => {
	try {
		const books = Book.findAll();
		res.status(200).json(books);
	} catch (error) {
		console.error("Erreur lors de la récupération des livres :", error);
		res.status(500).json({ message: "Impossible de récupérer les livres." });
	}
});

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
