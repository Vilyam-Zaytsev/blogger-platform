import {Router} from "express";
import {usersController} from "./usersController";
import {
    userEmailInputValidator,
    userLoginInputValidator,
    userPasswordInputValidator
} from "./middlewares/userValidators";
import {inputCheckErrorsMiddleware} from "../common/middlewares/input-check-errors-middleware";
import {authMiddleware} from "../common/middlewares/authorization-middleware";

const usersRouter = Router();

usersRouter.get('/', usersController.getUsers);
usersRouter.get('/:id', usersController.getUser);
usersRouter.post('/',
    authMiddleware,
    userLoginInputValidator,
    userEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    usersController.createAndInsertUser
);
usersRouter.delete('/:id',
    authMiddleware,
    usersController.deleteUser
);


export {usersRouter};