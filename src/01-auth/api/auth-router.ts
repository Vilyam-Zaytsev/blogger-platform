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
    activeSessionGuard,
    userLoginOrEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    authController.login.bind(authController)
);
authRouter.post(SETTINGS.PATH.AUTH.LOGOUT,
    refreshTokenGuard,
    authController.logout.bind(authController)
);
authRouter.post(SETTINGS.PATH.AUTH.REGISTRATION,
    rateLimitsGuard,
    userLoginInputValidator,
    userEmailInputValidator,
    userPasswordInputValidator,
    inputCheckErrorsMiddleware,
    authController.registration.bind(authController)
);
authRouter.post(SETTINGS.PATH.AUTH.REFRESH_TOKEN,
    refreshTokenGuard,
    authController.refreshToken.bind(authController)
);
authRouter.post(SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION,
    rateLimitsGuard,
    authConfirmationCodeInputValidator,
    inputCheckErrorsMiddleware,
    authController.registrationConfirmation.bind(authController)
);
authRouter.post(SETTINGS.PATH.AUTH.REGISTRATION_EMAIL_RESENDING,
    rateLimitsGuard,
    userEmailInputValidator,
    inputCheckErrorsMiddleware,
    authController.registrationEmailResending.bind(authController)
);
authRouter.get(SETTINGS.PATH.AUTH.ME,
    accessTokenGuard,
    authController.me.bind(authController)
);

export {authRouter};