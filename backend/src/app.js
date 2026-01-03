// import Author from "./models/author.js";
import Book from "./models/book.js";
import { seedDatabase } from "./db/seeds/seed.js";
import express from "express";
import bookRouter from "./routes/books.js";
import authorsRouter from "./routes/authors.js";

// "seedDatabase()" pour initialiser la base de données avec des données de test
// if (Book.count() === 0) seedDatabase();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
	console.log("Yes !");
	res.status(200).send("Library Management API is running.");
	// Future page d'accueil
});

app.use("/api/books", bookRouter);
app.use("/api/authors", authorsRouter);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
