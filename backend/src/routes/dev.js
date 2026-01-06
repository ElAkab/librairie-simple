import express from "express";
import Author from "../models/author.js";
import Book from "../models/book.js";
import Loan from "../models/loan.js";
import { customQuery } from "../commands/query.js";

const devRouter = express.Router();

// Route de test SQL
devRouter.get("/test", (_req, res) => {
	try {
		// Requête pour trouver les auteurs et leurs livres.
		const query = customQuery(`
			SELECT authors.id AS author_id, authors.firstName || ' ' || authors.lastName AS author_name, books.title AS book_title, books.id AS book_id
			FROM authors
			JOIN books ON authors.id = books.author_id
			GROUP BY authors.id;
		`);

		if (query.length === 0) {
			return res.status(404).json({
				message: "Aucun livre trouvé avec plusieurs auteurs.",
				results: query,
			});
		}

		res.send("GG");
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur serveur" });
	}
});

// Route pour voir toutes les tables
devRouter.get("/all", (_req, res) => {
	try {
		const allAuthors = Author.findAll();
		const allBooks = Book.findAll();
		const allLoans = Loan.findAll();

		console.table(allAuthors);
		console.table(allBooks);
		console.table(allLoans);

		res.status(200).json([
			{ table: "authors", data: allAuthors },
			{ table: "books", data: allBooks },
			{ table: "loans", data: allLoans },
		]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur serveur" });
	}
});

export default devRouter;
