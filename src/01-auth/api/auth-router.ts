import {Router} from "express";
import {authController} from "../auth-controller";
import {
    userEmailInputValidator,
    userLoginInputValidator,
    userLoginOrEmailInputValidator,
    userPasswordInputValidator
} from "../../04-users/api/middlewares/user-validators";
import {inputCheckErrorsMiddleware} from "../../common/middlewares/input-check-errors-middleware";
import {SETTINGS} from "../../common/settings";
import {accessTokenGuard} from "./guards/access-token-guard";
import {authConfirmationCodeInputValidator} from "./middlewares/auth-validators";
import {refreshTokenGuard} from "./guards/refresh-token-guard";
import {activeSessionGuard} from "./guards/active-session-guard";
import {rateLimitsGuard} from "../../common/middlewares/rate-limits-guard";

const authRouter = Router();

authRouter.post(SETTINGS.PATH.AUTH.LOGIN,
    rateLimitsGuard,
    // activeSessionGuard,
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