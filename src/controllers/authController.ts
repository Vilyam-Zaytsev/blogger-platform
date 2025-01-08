import {Response} from "express";
import {RequestWithBody} from "../types/input-output-types/request-types";
import {LoginInputType} from "../types/input-output-types/login-types";
import {authService} from "../services/auth-service";
import {SETTINGS} from "../settings";

const authController = {
    login: async (
        req: RequestWithBody<LoginInputType>,
        res: Response
    ) => {
        const authParams: LoginInputType = {
            loginOrEmail: req.body.loginOrEmail,
            password: req.body.password
        };

        const isAuth: boolean = await authService
            .login(authParams);

        if (!isAuth) {
        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }
};

export {authController};