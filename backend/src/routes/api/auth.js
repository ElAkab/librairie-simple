import express from "express";
import { signup } from "../../controllers/signup.js";
import { login } from "../../controllers/login.js";
import * as auth from "../../controllers/authManagement.js";

export const authRouter = express.Router();

// Routes d'inscription
authRouter.post("/signup", signup);

// Routes de connexion
authRouter.post("/login", login);

// Route pour récupérer tous les utilisateurs
authRouter.get("/all", auth.getAllUsers);

// Route pour récupérer un utilisateur par ID
authRouter.get("/:id", auth.getUserById);

// Route pour mettre à jour un utilisateur
authRouter.put("/update/:id", auth.updateUsername);

// Route pour supprimer tous les utilisateurs
authRouter.delete("/clear", auth.clearUsers);

// Route pour supprimer un utilisateur par ID
authRouter.delete("/:id", auth.deleteById);
