import {Router} from "express";
import {usersController} from "./usersController";
import {
    userEmailInputValidator,
    userLoginInputValidator,
    userPasswordInputValidator
} from "./middlewares/userValidators";
import {inputCheckErrorsMiddleware} from "../common/middlewares/input-check-errors-middleware";
import {baseAuthMiddleware} from "../common/middlewares/base-authorization-middleware";

const usersRouter = Router();

usersRouter.get('/',
    baseAuthMiddleware,
    usersController.getUsers
);
usersRouter.get('/:id', usersController.getUser);
usersRouter.post('/',
    baseAuthMiddleware,
    userLoginInputValidator,
    userEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    usersController.createAndInsertUser
);
usersRouter.delete('/:id',
    baseAuthMiddleware,
    usersController.deleteUser
);


export {usersRouter};