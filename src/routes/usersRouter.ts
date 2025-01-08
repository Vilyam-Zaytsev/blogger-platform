import {Router} from "express";
import {usersController} from "../controllers/usersController";
import {
    userEmailInputValidator,
    userLoginInputValidator,
    userPasswordInputValidator
} from "../middlewares/user-middlewares/userValidators";
import {inputCheckErrorsMiddleware} from "../middlewares/global-middlewares/input-check-errors-middleware";
import {authMiddleware} from "../middlewares/global-middlewares/authorization-middleware";

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
usersRouter.delete('/:id', usersController.deleteUser);


export {usersRouter};