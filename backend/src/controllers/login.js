import bcrypt from "bcryptjs";
import User from "../models/user";

export async function login(req, res) {
	try {
		// 1 : Récupération des données
		let { username, password } = req.body;

		username = username.trim();
		password = password.trim();

		// 2 : Validation des champs
		if (!username || !password)
			return res.status(400).json({ message: "Champs manquants." });

		// 3 : Authentification (à implémenter)
		const user = await User.checkExistsByUsername(username);

		if (user.rows.length === 0)
			return res.status(404).json({ message: "Utilisateur non trouvé :/..." });

		const passwordCompared = await bcrypt.compare(
			password,
			user.rows[0].password_hash,
		);

		if (!passwordCompared)
			return res.status(400).json({ message: "Mot de passe invalide :/..." });

		// 4 : Création de la session
		req.session.user = {
			id: user.rows[0].id,
			username: user.rows[0].username,
			role: user.rows[0].role,
		};

		// 5 : Réponse de succès
		res.status(200).json({
			message: "Connexion réussie !",
		});
	} catch (error) {
		console.error("Erreur serveur lors de la connexion :", error);
		res.status(500).json({ message: "Erreur serveur lors de la connexion." });
	}
}
