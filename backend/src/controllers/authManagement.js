import User from "../models/user.js";

export async function getUserById(req, res) {
	try {
		const { id } = req.params;
		const result = await User.getById(id);

		if (result.rows.length === 0) {
			return res.status(404).json({
				message: "Utilisateur non trouvé.",
			});
		}

		res.status(200).json({
			message: "Utilisateur récupéré avec succès.",
			result: result.rows[0], // Renvoie le premier (et unique) utilisateur trouvé
			isAuth: true,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération de l'utilisateur :", error);
		res.status(500).json({
			message: "Erreur serveur lors de la récupération de l'utilisateur.",
		});
	}
}

export async function getAllUsers(req, res) {
	try {
		const result = await User.getAll();

		if (result.rows.length === 0) {
			return res.status(404).json({
				message: "Aucun utilisateur trouvé.",
			});
		}

		res.status(200).json({
			message: "Utilisateurs récupérés avec succès.",
			result: result.rows,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des utilisateurs :", error);
		res.status(500).json({
			message: "Erreur serveur lors de la récupération des utilisateurs.",
		});
	}
}

export async function updateUsername(req, res) {
	try {
		const { id } = req.params;
		const { newUsername } = req.body;
		const updateResult = await User.updateUsernameById(id, {
			username: newUsername,
		});

		if (updateResult.rowCount === 0) {
			return res.status(404).json({
				message: "Utilisateur non trouvé.",
			});
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

export async function deleteById(req, res) {
	try {
		const { id } = req.params;

		const deleteResult = await User.deleteById(id);

		if (deleteResult.rowCount === 0) {
			return res.status(404).json({
				message: "Utilisateur non trouvé.",
			});
		}

		req.session.destroy(() => {
			res.json({ message: "Logged out" });
		});

		res.json({
			message: "Utilisateur et session supprimé avec succès.",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression de l'utilisateur :", error);
		res.status(500).json({
			message: "Erreur serveur lors de la suppression de l'utilisateur.",
		});
	}
}

export async function clearUsers(req, res) {
	try {
		if (!(await User.getAll()).rows.length) {
			return res.status(404).json({
				message: "Aucun utilisateur trouvé.",
			});
		}

		const result = await User.clear();

		res.status(205).json({
			message: "Utilisateurs supprimés avec succès.",
			result: result.rows,
		});
	} catch (error) {
		console.error("Erreur lors de la suppression des utilisateurs :", error);
		res.status(500).json({
			message: "Erreur serveur lors de la suppression des utilisateurs.",
		});
	}
}
