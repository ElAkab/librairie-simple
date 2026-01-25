import User from "../models/user.js";
import type { User as UserType } from "../db/database.js";
import type { Request, Response } from "express";

export async function getUserById(req: Request, res: Response): Promise<void> {
	try {
		const { id } = req.params;

		const result: UserType | null = await User.getById(Number(id));

		if (!result) {
			res.status(404).json({
				message: "Utilisateur non trouvé.",
			});
			return;
		}

		res.status(200).json({
			message: "Utilisateur récupéré avec succès.",
			result: result, // Renvoie le premier (et unique) utilisateur trouvé
			isAuth: true,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération de l'utilisateur :", error);
		res.status(500).json({
			message: "Erreur serveur lors de la récupération de l'utilisateur.",
		});
	}
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
	try {
		const result: { users: UserType[] } = await User.getAll();

		if (result.users.length === 0) {
			res.status(404).json({
				message: "Aucun utilisateur trouvé.",
			});
			return;
		}

		res.status(200).json({
			message: "Utilisateurs récupérés avec succès.",
			result: result.users,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des utilisateurs :", error);
		res.status(500).json({
			message: "Erreur serveur lors de la récupération des utilisateurs.",
		});
	}
}

export async function updateUsername(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		const { id } = req.params;
		const { newUsername } = req.body;
		const updateResult = await User.updateUsernameById(Number(id), {
			username: newUsername,
		});

		if (updateResult.rowCount === 0) {
			res.status(404).json({
				message: "Utilisateur non trouvé.",
			});
			return;
		}

		res.status(200).json({
			message: "Nom d'utilisateur mis à jour avec succès.",
			newUsername: newUsername,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour du nom d'utilisateur :",
			error,
		);
		res.status(500).json({
			message: "Erreur serveur lors de la mise à jour du nom d'utilisateur.",
		});
	}
}

export async function logoutById(req: Request, res: Response): Promise<void> {
	// Peut retourner une réponse ou undefined
	try {
		const { id } = req.params;

		const userResult = await User.getById(Number(id));
		if (!userResult) {
			res.status(404).json({
				message: "Utilisateur non trouvé.",
			});
			return;
		}

		// Rendre la colonne "is_active" d'un utilisateur à false lors de la déconnexion
		await User.updateAvailabilityById(Number(id), { is_active: false });

		// Détruire la session de l'utilisateur
		if (req.session)
			req.session.destroy(() => {
				res.json({ message: "Déconnexion réussie (-_-)/)..." });
			});
	} catch (error) {
		console.error("Erreur lors de la déconnexion de l'utilisateur :", error);
		res.status(500).json({
			message: "Erreur serveur lors de la déconnexion de l'utilisateur.",
		});
	}
}

export async function deleteById(req: Request, res: Response): Promise<void> {
	try {
		const { id } = req.params;

		const deleteResult = await User.deleteById(Number(id));
		if (deleteResult.rowCount === 0) {
			res.status(404).json({
				message: "Utilisateur non trouvé.",
			});
			return;
		}

		res.json({
			message: "Utilisateur supprimé avec succès.",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression de l'utilisateur :", error);
		res.status(500).json({
			message: "Erreur serveur lors de la suppression de l'utilisateur.",
		});
	}
}

export async function clearUsers(req: Request, res: Response): Promise<void> {
	try {
		if (!(await User.count()).count) {
			res.status(404).json({
				message: "Aucun utilisateur trouvé.",
			});
			return;
		}

		const result = await User.clear();

		res.status(205).json({
			message: "Utilisateurs supprimés avec succès.",
			result: result.rowCount,
		});
	} catch (error) {
		console.error("Erreur lors de la suppression des utilisateurs :", error);
		res.status(500).json({
			message: "Erreur serveur lors de la suppression des utilisateurs.",
		});
	}
}
