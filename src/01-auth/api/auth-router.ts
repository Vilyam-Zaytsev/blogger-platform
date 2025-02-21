import {Router} from "express";
import {authController} from "../auth-controller";
import {
    userEmailInputValidator,
    userLoginInputValidator,
    userLoginOrEmailInputValidator,
    userPasswordInputValidator
} from "../../03-users/middlewares/user-validators";
import {inputCheckErrorsMiddleware} from "../../common/middlewares/input-check-errors-middleware";
import {SETTINGS} from "../../common/settings";
import {accessTokenGuard} from "./guards/access-token-guard";
import {authConfirmationCodeInputValidator} from "./middlewares/auth-validators";
import {refreshTokenGuard} from "./guards/refresh-token-guard";

const authRouter = Router();

authRouter.post(SETTINGS.PATH.AUTH.LOGIN,
    userLoginOrEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    authController.login
);
authRouter.post(SETTINGS.PATH.AUTH.LOGOUT,
    refreshTokenGuard,
    authController.logout
);
authRouter.post(SETTINGS.PATH.AUTH.REGISTRATION,
    userLoginInputValidator,
    userEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    authController.registration
);
authRouter.post(SETTINGS.PATH.AUTH.REFRESH_TOKEN,
    refreshTokenGuard,
    authController.refreshToken
);
authRouter.post(SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION,
    authConfirmationCodeInputValidator,
    inputCheckErrorsMiddleware,
    authController.registrationConfirmation
);
authRouter.post(SETTINGS.PATH.AUTH.REGISTRATION_EMAIL_RESENDING,
    userEmailInputValidator,
    inputCheckErrorsMiddleware,
    authController.registrationEmailResending
);
authRouter.get(SETTINGS.PATH.AUTH.ME,
    accessTokenGuard,
    authController.me
);

export {authRouter};