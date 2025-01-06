import {Router} from "express";
import {usersController} from "../controllers/usersController";

const usersRouter = Router();

usersRouter.get('/', usersController.getUsers);
usersRouter.post('/', usersController.createAndInsertUser);
usersRouter.delete('/:id', usersController.deleteUser);

export {usersRouter};