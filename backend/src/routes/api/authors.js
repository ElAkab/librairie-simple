import express from "express";
import Author from "../../models/author.js";

const authorsRouter = express.Router();

// Récupération de tous les auteurs
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

// Création d'un nouvel auteur
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

// Récupération d'un auteur par son ID
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

// Mise à jour d'un auteur
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

// Suppression d'un auteur
authorsRouter.delete("/:id", (req, res) => {
	try {
		const id = req.params.id;

		if (!id)
			return res.status(400).json({
				message: "Aucune correspondance trouvé pour la suppression :/",
			});

		const change = Author.deleteById(id);
		res.status(200).json({
			message: "Auteur supprimé avec succès.",
			change: change,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la suppression de l'auteur putain... :",
			error
		);
		res.status(500).json({ message: "Impossible de supprimer l'auteur.." });
	}
});

export default authorsRouter;
