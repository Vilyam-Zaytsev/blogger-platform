import {Router} from "express";
import {authController} from "./authController";

const authRouter = Router();

authRouter.post('/', authController.login);

export {authRouter};