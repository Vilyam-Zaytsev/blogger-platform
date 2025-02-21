import {Response} from "express";
import {RequestWithBody, RequestWithUserId} from "../common/types/input-output-types/request-types";
import {LoginInputModel} from "./types/login-input-model";
import {authService} from "./domain/auth-service";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatus} from "../common/types/result-types/result-status";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {mapResultExtensionsToErrorMessage} from "../common/helpers/map-result-extensions-to-error-message";
import {ApiErrorResult} from "../common/types/input-output-types/api-error-result";
import {IdType} from "../common/types/input-output-types/id-type";
import {UserInputModel, UserMeViewModel} from "../03-users/types/input-output-types";
import {LoginSuccessViewModel} from "./types/login-success-view-model";
import {SETTINGS} from "../common/settings";
import {RegistrationConfirmationCodeModel} from "./types/registration-confirmation-code-model";
import {RegistrationEmailResendingType} from "./types/registration-email-resending-type";
import {usersQueryRepository} from "../03-users/repositoryes/users-query-repository";
import {AuthTokens} from "./types/auth-tokens-type";
import {jwtService} from "./adapters/jwt-service";

const authController = {

    login: async (
        req: RequestWithBody<LoginInputModel>,
        res: Response<ApiErrorResult | LoginSuccessViewModel>
    ) => {

        const authParams: LoginInputModel = {
            loginOrEmail: req.body.loginOrEmail,
            password: req.body.password
        };

        const resultLogin: ResultType<AuthTokens | null> = await authService
            .login(authParams);

        if (resultLogin.status !== ResultStatus.Success) {

            res
                .status(mapResultStatusToHttpStatus(resultLogin.status))
                .json(mapResultExtensionsToErrorMessage(resultLogin.extensions));

            return;
        }

        const {
            accessToken,
            refreshToken
        } = resultLogin.data!;

        res
            .status(mapResultStatusToHttpStatus(resultLogin.status))
            .cookie(
                'refreshToken',
                refreshToken,
                {httpOnly: true, secure: true,}
            )
            .json({accessToken});
    },

    logout: async (
        req: RequestWithUserId<IdType>,
        res: Response
    ) => {

        const userId: string = String(req.user?.id);

        if (!userId) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
        }

        const resultTokenReviews: ResultType<string | null> = await authService
            .revokeRefreshToken(req.cookies.refreshToken);

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    },

    refreshToken: async (
        req: RequestWithUserId<IdType>,
        res: Response<ApiErrorResult | LoginSuccessViewModel>
    ) => {

        const userId: string = String(req.user?.id);

        if (!userId) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
        }

        const resultTokenReviews: ResultType<string | null> = await authService
            .revokeRefreshToken(req.cookies.refreshToken);

        const accessToken: string = await jwtService
            .createAccessToken(userId);

        const refreshToken: string = await jwtService
            .createRefreshToken(userId);

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .cookie(
                'refreshToken',
                refreshToken,
                {httpOnly: true, secure: true,}
            )
            .json({accessToken});
    },

    registration: async (
        req: RequestWithBody<UserInputModel>,
        res: Response
    ) => {

        const dataForRegistrationUser: UserInputModel = {
            login: req.body.login,
            email: req.body.email,
            password: req.body.password
        };

        const resultRegistration: ResultType<string | null> = await authService
            .registration(dataForRegistrationUser);

        if (resultRegistration.status !== ResultStatus.Success) {

            res
                .status(mapResultStatusToHttpStatus(resultRegistration.status))
                .json(mapResultExtensionsToErrorMessage(resultRegistration.extensions));

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    },

    registrationConfirmation: async (
        req: RequestWithBody<RegistrationConfirmationCodeModel>,
        res: Response
    ) => {

        const {code} = req.body

        const resultRegistrationConfirmation: ResultType = await authService
            .registrationConfirmation(code);

        if (resultRegistrationConfirmation.status !== ResultStatus.Success) {

            res
                .status(mapResultStatusToHttpStatus(resultRegistrationConfirmation.status))
                .json(mapResultExtensionsToErrorMessage(resultRegistrationConfirmation.extensions));

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    },

    registrationEmailResending: async (
        req: RequestWithBody<RegistrationEmailResendingType>,
        res: Response
    ) => {

        const {email} = req.body;

        const resultEmailResending = await authService
            .registrationEmailResending(email);

        if (resultEmailResending.status !== ResultStatus.Success) {

            res
                .status(mapResultStatusToHttpStatus(resultEmailResending.status))
                .json(mapResultExtensionsToErrorMessage(resultEmailResending.extensions));

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    },

    me: async (
        req: RequestWithUserId<IdType>,
        res: Response<UserMeViewModel>
    ) => {

        const userId: string = String(req.user?.id);

        if (!userId) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
        }

        const me: UserMeViewModel | null = await usersQueryRepository
            .findUserAndMapToMeViewModel(userId);

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(me!);
    },
};

export {authController};