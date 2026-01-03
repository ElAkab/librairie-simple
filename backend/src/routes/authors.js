import express from "express";
import Author from "../models/author.js";

const authorsRouter = express.Router();

authorsRouter.get("/", (req, res) => {
	try {
		const table = Author.findAll();

		console.table(table);
		res.status(200).json(table);
	} catch (error) {
		console.error("Erreur lors de la récupération des auteurs :", error);
		res.status(500).json({ message: "Impossible de récupérer les auteurs." });
	}
});

authorsRouter.post("/", (req, res) => {
	try {
		const { firstName, lastName, birth_year, nationality } = req.body;

		if (!firstName || !lastName || !birth_year || !nationality)
			return res
				.status(400)
				.json({ message: "Champs obligatoires manquants :/" });

		const id = Author.createAuthor(
			firstName,
			lastName,
			birth_year,
			nationality
		);

		res.status(201).json({
			message: `Congrate ${(firstName, lastName)}`,
			id: id,
		});
	} catch (error) {
		console.error("Erreur lors de la création de l'auteur :", error);

		res.status(500).json({ message: "Impossible de créer l'auteur..." });
	}
});

authorsRouter.get("/:id", (req, res) => {
	try {
		const id = req.params.id;

		if (!id) return res.status(400).json({ message: "ID non fourni." });

		const author = Author.findById(id);

		res.status(200).json(author);
	} catch (error) {
		console.error("Erreur lors de la récupération de l'auteur :", error);
		res.status(500).json({ message: "Impossible de récupérer l'auteur." });
	}
});

authorsRouter.put("/:id", (req, res) => {
	try {
		const { firstName, lastName, nationality } = req.body;
		const id = req.params.id;

		if (!firstName || !lastName || !nationality)
			return res
				.status(400)
				.json({ message: "Champs obligatoires manquants :/" });

		const changes = Author.updateAuthor(firstName, lastName, nationality, id);

		res.status(200).json({
			message: "Auteur mis à jour avec succès.",
			change: `Nombre de lignes modifiées : ${changes}`,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour de l'auteur :", error);
		res.status(500).json({ message: "Impossible de mettre à jour l'auteur." });
	}
});

export default authorsRouter;
