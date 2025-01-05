import {Router} from "express";
import {usersController} from "../controllers/usersController";

const usersRouter = Router();

usersRouter.get('/', usersController.getUsers);

export {usersRouter};