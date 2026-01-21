import express from "express";
import { signup, login } from "../../controllers/signup.js";

export const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
