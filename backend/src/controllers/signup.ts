import bcrypt from "bcryptjs";
import validator from "validator";
import pool from "../db/connection.js";
import User from "../models/user.js";
import type { Request, Response } from "express";

export async function signup(req: Request, res: Response) {
	try {
		// 1 : Récupération des données
		let { username, email, password } = req.body;

		username = username.trim();
		email = email.trim();
		password = password.trim();

		// 2 : Validation des champs et de l'unicité du username et de l'email
		if (!username || !email || !password) {
			res.status(400).json({ message: "Champs manquants." });
			return;
		}

		if (!validator.isEmail(email)) {
			res.status(400).json({ message: "Addresse email invalide" });
			return;
		}

		const isUserStored = await pool.query(
			`
			SELECT email FROM users WHERE username = $1 OR email = $2 
		`,
			[username, email],
		);

		// if (isUserStored) FAUX : ça sera toujours vrai (donc pas assez précis)
		if (isUserStored.rows.length > 0) {
			res.status(409).json({ message: "Utilisateur déjà inscrit !" });
			return;
		}

		// 3 : Hachage du mot de passe
		const hashedPassword = await bcrypt.hash(password, 10);

		// 4 : Validation supplémentaire du mot de passe (optionnel)
		// if (password.length < 8) {
		// 	return res.status(400).json({ message: "Mot de passe trop court." });
		// }

		// 5 : Insertion des données dans la DB
		const newUser = await User.create(username, email, hashedPassword, "user");

		req.session.user = {
			id: newUser.id,
			username: newUser.username,
			email: newUser.email,
			role: newUser.role,
		};

		console.log("Nouvel utilisateur inscrit :", newUser);
		res.status(201).json({ message: "Utilisateur inscrit avec succès." });
	} catch (error) {
		console.error("Erreur lors de l'inscription :", error);
		res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
	}
}
