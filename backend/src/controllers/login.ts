import bcrypt from "bcryptjs";
import User from "../models/user.js";
import type { Request, Response } from "express";

export async function login(req: Request, res: Response) {
	try {
		// 1 : Récupération des données
		let { username, password } = req.body;

		username = username.trim();
		password = password.trim();

		// 2 : Validation des champs
		if (!username || !password) {
			res.status(400).json({ message: "Champs manquants." });
			return;
		}

		// 3 : Authentification
		const user = await User.checkExistsByUsername(username);

		if (user.rowCount === 0) {
			res.status(404).json({ message: "Utilisateur non trouvé :/..." });
			return;
		}

		const passwordCompared = await bcrypt.compare(
			password,
			user.rows[0].password_hash,
		);

		if (!passwordCompared) {
			res.status(400).json({ message: "Mot de passe invalide :/..." });
			return;
		}

		const userId = user.rows[0].id;

		// 4 : Création de la session
		req.session.user = {
			id: user.rows[0].id,
			username: user.rows[0].username,
			email: user.rows[0].email,
			role: user.rows[0].role,
		};

		// Rendre la colonne "is_active" d'un utilisateur à true lors de la déconnexion
		await User.updateAvailabilityById(userId, { is_active: true });

		// 5 : Réponse de succès
		res.status(200).json({
			message: "Connexion réussie !",
			user: req.session.user, // Renvoie les informations de l'utilisateur connecté pour le frontend
		});
	} catch (error) {
		console.error("Erreur serveur lors de la connexion :", error);
		res.status(500).json({ message: "Erreur serveur lors de la connexion." });
	}
}
