import {Router} from "express";
import {authController} from "./auth-controller";
import {
    userEmailInputValidator,
    userLoginInputValidator,
    userLoginOrEmailInputValidator,
    userPasswordInputValidator
} from "../02-users/middlewares/user-validators";
import {inputCheckErrorsMiddleware} from "../common/middlewares/input-check-errors-middleware";
import {SETTINGS} from "../common/settings";
import {bearerAuthorizationMiddleware} from "../common/middlewares/bearer-authorization-middleware";
import {authConfirmationCodeInputValidator} from "./middlewares/auth-validators";

const authRouter = Router();

authRouter.post(SETTINGS.PATH.AUTH.LOGIN,
    userLoginOrEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    authController.login
);
authRouter.post(SETTINGS.PATH.AUTH.REGISTRATION,
    userLoginInputValidator,
    userEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    authController.registration
);
authRouter.post(SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION,
    authConfirmationCodeInputValidator,
    inputCheckErrorsMiddleware,
    authController.registration
);
authRouter.get(SETTINGS.PATH.AUTH.ME,
    bearerAuthorizationMiddleware,
    authController.me
);

export {authRouter};