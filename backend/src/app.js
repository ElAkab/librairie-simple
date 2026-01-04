// import Author from "./models/author.js";
import Author from "./models/author.js";
import Book from "./models/book.js";
import Loan from "./models/loan.js";
import { seedDatabase } from "./db/seeds/seed.js";
import express from "express";
import apiBookRouter from "./routes/api/books.js";
import authorsRouter from "./routes/api/authors.js";
import devRouter from "./routes/dev.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// "seedDatabase()" pour initialiser la base de données avec des données de test
if (Book.count() === 0) seedDatabase();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Routes API
app.use("/api/books", apiBookRouter);
app.use("/api/authors", authorsRouter);

// Routes de développement/debug
app.use(devRouter);

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, "../../frontend")));

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
