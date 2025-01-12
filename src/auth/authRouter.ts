import {Router} from "express";
import {authController} from "./authController";
import {userLoginOrEmailInputValidator, userPasswordInputValidator} from "../users/middlewares/userValidators";
import {inputCheckErrorsMiddleware} from "../common/middlewares/input-check-errors-middleware";

const authRouter = Router();

authRouter.post('/',
    userLoginOrEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    authController.login
);

export {authRouter};