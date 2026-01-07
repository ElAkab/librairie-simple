import express from "express";
import Loan from "../../models/loan.js";

const loansRouter = express.Router();

// Récupérer tous les emprunts
loansRouter.get("/", (req, res) => {
	try {
		console.log(req.query);

		const loans = Loan.findAll();
		console.table(loans);
		res.status(200).json(loans);
	} catch (error) {
		console.error("Erreur lors de la récupération des emprunts :", error);
		res
			.status(500)
			.json({ error: "Erreur lors de la récupération des emprunts" });
	}
});

// Récupérer un emprunt par son ID
loansRouter.get("/:id", (req, res) => {
	try {
		const id = req.params.id;

		if (!id)
			return res
				.status(400)
				.json({ message: "Aucune correspondance avec cet ID :/.." });

		const loans = Loan.findById(id);
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
loansRouter.post("/", (req, res) => {
	try {
		const { book_id, borrower_name, borrowed_date, return_date } = req.body;

		if (!book_id || !borrower_name || !borrowed_date)
			return res
				.status(400)
				.json({ message: "Données manquantes pour créer l'emprunt" });

		const newLoan = Loan.createLoan(
			book_id,
			borrower_name,
			borrowed_date,
			return_date
		);
		console.log(newLoan);
		res.status(200).json({
			message: "Emprunt créé avec succès",
			changes: newLoan,
		});
	} catch (error) {
		console.error("Erreur lors de la création de l'emprunt", error);
		res
			.status(500)
			.json({ message: "Erreur lors de la création de l'emprunt" });
	}
});

// Mettre à jour un emprunt par son ID
loansRouter.put("/:id", (req, res) => {
	try {
		const id = req.params.id;
		const { borrower_name, loan_status, return_date } = req.body;

		if (!id)
			return res
				.status(400)
				.json({ message: "Aucune correspondance avec cet ID :/.." });

		const updatedLoan = Loan.updateLoan(
			borrower_name,
			loan_status,
			return_date,
			id
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
loansRouter.patch("/:id", (req, res) => {
	try {
		const id = req.params.id;
		const { borrower_name, status, return_date } = req.body;

		if (!id)
			return res
				.status(400)
				.json({ message: "Aucune correspondance avec cet ID :/.." });

		// Récupérer l'emprunt actuel pour garder les valeurs non modifiées
		const currentLoan = Loan.findById(id);
		if (!currentLoan)
			return res.status(404).json({ message: "Emprunt introuvable" });

		const updatedLoan = Loan.updateLoan(
			borrower_name || currentLoan.borrower_name,
			status || currentLoan.loan_status,
			return_date !== undefined ? return_date : currentLoan.return_date,
			id
		);
		console.log(updatedLoan);
		res.status(200).json({
			message: "Emprunt mis à jour avec succès",
			changes: updatedLoan,
			details: [borrower_name, status, return_date],
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour de l'emprunt", error);
		res
			.status(500)
			.json({
				message: error.message || "Erreur lors de la mise à jour de l'emprunt",
			});
	}
});

// Supprimer un emprunt par son ID (optionnel)
loansRouter.delete("/:id", (req, res) => {
	try {
		const id = req.params.id;

		if (!id)
			return res
				.status(400)
				.json({ message: "Aucune correspondance avec cet ID :/.." });

		const changes = Loan.deleteById(id);
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
loansRouter.delete("/", (req, res) => {
	try {
		const changes = Loan.clear();
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
