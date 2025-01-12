import {Router} from "express";
import {authController} from "./authController";
import {userLoginOrEmailInputValidator, userPasswordInputValidator} from "../users/middlewares/userValidators";
import {inputCheckErrorsMiddleware} from "../common/middlewares/input-check-errors-middleware";
import {SETTINGS} from "../common/settings";

const authRouter = Router();

authRouter.post(SETTINGS.PATH.AUTH.LOGIN,
    userLoginOrEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    authController.login
);
authRouter.get(SETTINGS.PATH.AUTH.ME,
    userLoginOrEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    authController.login
);

export {authRouter};