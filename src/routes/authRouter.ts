import {Router} from "express";
import {authController} from "../controllers/authController";

const authRouter = Router();

authRouter.post('/', authController.login);

export {authRouter};