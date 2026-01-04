// import Author from "./models/author.js";
import Author from "./models/author.js";
import Book from "./models/book.js";
import Loan from "./models/loan.js";
import { seedDatabase } from "./db/seeds/seed.js";
import express from "express";
import bookRouter from "./routes/books.js";
import authorsRouter from "./routes/authors.js";
import { customQuery } from "./commands/query.js";

// "seedDatabase()" pour initialiser la base de données avec des données de test
if (Book.count() === 0) seedDatabase();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
	console.log("Yes !");
	res.status(200).send("API en ligne !");
	// Future page d'accueil
});

app.get("/test", (_req, res) => {
	try {
		// Requêtes SQL : ...
		const query = customQuery(`
			SELECT authors.id, authors.firstName, authors.lastName FROM authors
			JOIN books ON authors.id = books.author_id
			WHERE author_id IN (
				SELECT author_id FROM books
				GROUP BY author_id
				HAVING COUNT(author_id) > 1
			)
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

app.get("/all", (_req, res) => {
	try {
		// Récupérer tous les tables de la base de données
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

app.use("/api/books", bookRouter);
app.use("/api/authors", authorsRouter);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
