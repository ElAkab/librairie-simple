// import bcrypt from "bcryptjs";
// import validator from "validator";
// import pool from "../db/connection.js";
// import User from "../models/user.js";

export async function login(req, res) {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ message: "Champs manquants." });
		}

		console.log({
			message: "Données reçu avec succès !",
			data: [username, password],
		});

		res.status(200).json({
			message: "Données reçu avec succès !",
		});
	} catch (error) {
		console.error("Erreur serveur lors de la connexion :", error);
		res.status(500).json({ message: "Erreur serveur lors de la connexion." });
	}
}
