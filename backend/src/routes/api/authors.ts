import express from "express";
import Author from "../../models/author.js";
import type { Request, Response } from "express";

const authorsRouter = express.Router();

type AuthorsQuery = {
	page?: string;
	limit?: string;
	searched?: string;
};

// Récupération de tous les auteurs
authorsRouter.get(
	"/",
	async (req: Request<{}, unknown, {}, AuthorsQuery>, res: Response) => {
		try {
			const page: number = Number(req.query.page) || 1;
			const limit: number = Number(req.query.limit) || 6;
			const searched: string = req.query.searched ?? "";
			const offset: number = (page - 1) * limit;

			const table = await Author.findAll(limit, offset, searched);
			const total = await Author.count();

			console.table(table);
			res.status(200).json({
				data: table,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total.count / limit),
				},
			});
		} catch (error) {
			console.error("Erreur lors de la récupération des auteurs :", error);
			res.status(500).json({ message: "Impossible de récupérer les auteurs." });
		}
	},
);

// Création d'un nouvel auteur
authorsRouter.post("/", async (req: Request, res: Response): Promise<void> => {
	try {
		const { full_name, birth_year, nationality } = req.body;

		if (!full_name || !birth_year || !nationality) {
			res.status(400).json({ message: "Champs obligatoires manquants :/" });
			return;
		}

		const id = await Author.createAuthor(full_name, birth_year, nationality);

		res.status(201).json({
			message: `Congrate ${full_name}`,
			id: id,
		});
	} catch (error) {
		console.error("Erreur lors de la création de l'auteur :", error);

		res.status(500).json({ message: "Impossible de créer l'auteur..." });
	}
});

// Récupération d'un auteur par son ID
authorsRouter.get(
	"/:id",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id;

			if (!id) {
				res.status(400).json({ message: "ID non fourni." });
				return;
			}

			const author = await Author.findById(Number(id));

			if (!author) {
				res.status(404).json({ message: "Auteur introuvable." });
				return;
			}

			res.status(200).json(author);
		} catch (error) {
			console.error("Erreur lors de la récupération de l'auteur :", error);
			res.status(500).json({ message: "Impossible de récupérer l'auteur." });
		}
	},
);

// Mise à jour d'un auteur
authorsRouter.put(
	"/:id",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { full_name, nationality } = req.body;
			const id = req.params.id;

			if (!full_name || !nationality) {
				res.status(400).json({ message: "Champs obligatoires manquants :/" });
				return;
			}

			const changes = await Author.updateAuthor(
				full_name,
				nationality,
				Number(id),
			);

			res.status(200).json({
				message: "Auteur mis à jour avec succès.",
				change: `Nombre de lignes modifiées : ${changes}`,
			});
		} catch (error) {
			console.error("Erreur lors de la mise à jour de l'auteur :", error);
			res
				.status(500)
				.json({ message: "Impossible de mettre à jour l'auteur." });
		}
	},
);

// Suppression d'un auteur
authorsRouter.delete("/:id", async (req, res) => {
	try {
		const id = req.params.id;

		if (!id)
			return res.status(400).json({
				message: "Aucune correspondance trouvé pour la suppression :/",
			});

		const change = await Author.deleteById(Number(id));
		res.status(200).json({
			message: "Auteur supprimé avec succès.",
			change: change,
		});
	} catch (error) {
		console.error("Erreur lors de la suppression de l'auteur :", error);
		res.status(500).json({ message: "Impossible de supprimer l'auteur.." });
	}
});

export default authorsRouter;
