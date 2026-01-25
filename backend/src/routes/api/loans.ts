import express from "express";
import Loan from "../../models/loan.js";
import type { Request, Response } from "express";

const loansRouter = express.Router();

type LoanQuery = {
	page?: string;
	limit?: string;
	searched?: string;
};

// Récupérer tous les emprunts
loansRouter.get(
	"/",
	async (req: Request<{}, unknown, {}, LoanQuery>, res: Response) => {
		try {
			console.log(req.query);

			const page: number = Number(req.query.page) || 1;
			const limit: number = Number(req.query.limit) || 6;
			const searched: string = req.query.searched?.trim() || "";
			const offset: number = (page - 1) * limit;

			const loans = await Loan.findAll(limit, offset, searched);
			const total = await Loan.count();

			console.table(loans);
			res.status(200).json({
				data: loans,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit),
				},
			});
		} catch (error) {
			console.error("Erreur lors de la récupération des emprunts :", error);
			res
				.status(500)
				.json({ error: "Erreur lors de la récupération des emprunts" });
		}
	},
);

// Récupérer un emprunt par son ID
loansRouter.get("/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (!id)
			return res
				.status(400)
				.json({ message: "Aucune correspondance avec cet ID :/.." });

		const loans = await Loan.findById(Number(id));

		if (!loans) {
			return res.status(404).json({ message: "Emprunt introuvable" });
		}

		console.table(loans);
		res.status(200).json(loans);
	} catch (error) {
		console.error("Erreur lors de la récupération de l'emprunt", error);
		res
			.status(500)
			.json({ message: "Erreur lors de la récupération de l'emprunt" });
	}
});

// Créer un nouvel emprunt
loansRouter.post("/", async (req: Request, res: Response) => {
	try {
		const { book_id, borrower_name, borrowed_date, return_date } = req.body;

		if (!book_id || !borrower_name || !borrowed_date)
			return res
				.status(400)
				.json({ message: "Données manquantes pour créer l'emprunt" });

		const newLoan = await Loan.createLoan(
			book_id,
			borrower_name,
			borrowed_date,
			return_date,
		);
		console.log(newLoan);
		res.status(200).json({
			message: "Emprunt créé avec succès",
			loan: newLoan,
		});
	} catch (error) {
		console.error("Erreur lors de la création de l'emprunt", error);
		res
			.status(500)
			.json({ message: "Erreur lors de la création de l'emprunt" });
	}
});

// Mettre à jour un emprunt par son ID
loansRouter.put("/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const { borrower_name, loan_status, return_date } = req.body;

		if (!id)
			return res
				.status(400)
				.json({ message: "Aucune correspondance avec cet ID :/.." });

		const updatedLoan = await Loan.updateLoan(
			borrower_name,
			loan_status,
			return_date,
			Number(id),
		);
		console.log(updatedLoan);
		res.status(200).json({
			message: "Emprunt mis à jour avec succès",
			changes: updatedLoan,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour de l'emprunt", error);
		res
			.status(500)
			.json({ message: "Erreur lors de la mise à jour de l'emprunt" });
	}
});

// Mettre à jour partiellement un emprunt par son ID (PATCH)
loansRouter.patch("/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;
		const { borrower_name, status, return_date } = req.body;

		if (!id)
			return res
				.status(400)
				.json({ message: "Aucune correspondance avec cet ID :/.." });

		// Récupérer l'emprunt actuel pour garder les valeurs non modifiées
		const currentLoan = await Loan.findById(Number(id));
		if (!currentLoan)
			return res.status(404).json({ message: "Emprunt introuvable" });

		const updatedLoan = await Loan.updateLoan(
			borrower_name || currentLoan.borrower_name,
			status || currentLoan.loan_status,
			return_date !== undefined ? return_date : currentLoan.return_date,
			Number(id),
		);
		console.log(updatedLoan);
		res.status(200).json({
			message: "Emprunt mis à jour avec succès",
			changes: updatedLoan,
			details: [borrower_name, status, return_date],
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour de l'emprunt", error);
		res.status(500).json({
			message: "Erreur lors de la mise à jour de l'emprunt",
		});
	}
});

// Supprimer un emprunt par son ID (optionnel)
loansRouter.delete("/:id", async (req: Request, res: Response) => {
	try {
		const id = req.params.id;

		if (!id)
			return res
				.status(400)
				.json({ message: "Aucune correspondance avec cet ID :/.." });

		const changes = await Loan.deleteById(Number(id));
		res.status(200).json({
			message: "Suppression effectuée avec succè !",
			changes: changes,
		});
	} catch (error) {
		console.error("La suppression n'a pas pu se faire :/.. Erreur :", error);
		res
			.status(500)
			.json({ message: "Erreur lors de la suppression de l'emprunt" });
	}
});

// Supprimer tous les emprunts
loansRouter.delete("/", async (req: Request, res: Response) => {
	try {
		const changes = await Loan.clear();
		res.status(200).json({
			message: "Tous les emprunts ont été supprimés avec succès !",
			changes: changes,
		});
	} catch (error) {
		console.error("La suppression n'a pas pu se faire :/.. Erreur :", error);
		res
			.status(500)
			.json({ message: "Erreur lors de la suppression de l'emprunt" });
	}
});

export default loansRouter;
