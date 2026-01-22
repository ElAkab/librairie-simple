import bcrypt from "bcryptjs";
import validator from "validator";
import pool from "../db/connection.js";
import User from "../models/user.js";

export async function signup(req, res) {
	try {
		// 1 : Récupération des données
		const { username, email, password } = req.body;

		// 2 : Validation des champs et de l'unicité du username et de l'email
		if (!username || !email || !password)
			return res.status(400).json({ message: "Champs manquants." });

		if (!validator.isEmail(email))
			return res.status(400).json({ message: "Addresse email invalide" });

		const isUserStored = await pool.query(
			`
			SELECT email FROM users WHERE username = $1 OR email = $2 
		`,
			[username, email],
		);

		// if (isUserStored) FAUX : ça sera toujours vrai (donc pas assez précis)
		if (isUserStored.rows.length > 0)
			return res.status(400).json({ message: "Utilisateur déjà inscrit !" });

		// 3 : Hachage du mot de passe
		const hashedPassword = await bcrypt.hash(password, 10);

		// 4 : Validation supplémentaire du mot de passe (optionnel)
		// if (password.length < 8) {
		// 	return res.status(400).json({ message: "Mot de passe trop court." });
		// }

		// 5 : Insertion des données dans la DB
		await pool.query(
			`
			INSERT INTO users(username, email, password_hash, role) 
			VALUES($1, $2, $3, $4)
		`,
			[username, email, hashedPassword, "user"],
		); // role > user || admin

		// 6 : Réponse de succès
		console.log("Nouvel utilisateur inscrit :", { username, email });
		res.status(201).json({ message: "Utilisateur inscrit avec succès." });
	} catch (error) {
		console.error("Erreur lors de l'inscription :", error);
		res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
	}
}
