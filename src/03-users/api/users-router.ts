import {Router} from "express";
import {UsersController} from "../users-controller";
import {
    userEmailInputValidator,
    userLoginInputValidator,
    userPasswordInputValidator
} from "./middlewares/user-validators";
import {inputCheckErrorsMiddleware} from "../../common/middlewares/input-check-errors-middleware";
import {baseAuthGuard} from "../../01-auth/api/guards/base-auth-guard";
import {container} from "../../composition-root";

const usersRouter = Router();
const usersController: UsersController = container.get(UsersController);

usersRouter.get('/',
    baseAuthGuard,
    usersController.getUsers.bind(usersController)
);
usersRouter.post('/',
    baseAuthGuard,
    userLoginInputValidator,
    userEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    usersController.createUser.bind(usersController)
);
usersRouter.delete('/:id',
    baseAuthGuard,
    usersController.deleteUser.bind(usersController)
);


export {usersRouter};