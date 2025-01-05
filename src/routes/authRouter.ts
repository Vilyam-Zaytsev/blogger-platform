import {Router} from "express";
import {authController} from "../controllers/authController";

const authRouter = Router();

authRouter.delete('/', authController.x);

export {authRouter};