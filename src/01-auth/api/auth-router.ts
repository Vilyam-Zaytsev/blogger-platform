import {Router} from "express";
import {
    userEmailInputValidator,
    userLoginInputValidator,
    userLoginOrEmailInputValidator, userNewPasswordInputValidator,
    userPasswordInputValidator
} from "../../03-users/api/middlewares/user-validators";
import {inputCheckErrorsMiddleware} from "../../common/middlewares/input-check-errors-middleware";
import {SETTINGS} from "../../common/settings";
import {accessTokenGuard} from "./guards/access-token-guard";
import {authConfirmationCodeInputValidator} from "./middlewares/auth-validators";
import {refreshTokenGuard} from "./guards/refresh-token-guard";
import {activeSessionGuard} from "./guards/active-session-guard";
import {rateLimitsGuard} from "../../common/middlewares/rate-limits-guard";
import {AuthController} from "../auth-controller";
import {container} from "../../composition-root";

const authRouter = Router();
const authController: AuthController = container.get(AuthController);

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
authRouter.post(SETTINGS.PATH.AUTH.PASSWORD_RECOVERY,
    rateLimitsGuard,
    userEmailInputValidator,
    inputCheckErrorsMiddleware,
    authController.passwordRecovery.bind(authController)
);
authRouter.post(SETTINGS.PATH.AUTH.NEW_PASSWORD,
    rateLimitsGuard,
    userNewPasswordInputValidator,
    inputCheckErrorsMiddleware,
    authController.newPassword.bind(authController)
);
authRouter.get(SETTINGS.PATH.AUTH.ME,
    accessTokenGuard,
    authController.me.bind(authController)
);

export {authRouter};