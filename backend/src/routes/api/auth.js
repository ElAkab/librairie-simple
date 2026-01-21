import express from "express";
import { signup } from "../../controllers/signup.js";

export const authRouter = express.Router();

authRouter.post("/signup", signup);
