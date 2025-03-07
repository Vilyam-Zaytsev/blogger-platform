import {Response} from "express";
import {RequestWithBody, RequestWithSession, RequestWithUserId} from "../common/types/input-output-types/request-types";
import {LoginInputModel} from "./types/login-input-model";
import {authService} from "./domain/auth-service";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatus} from "../common/types/result-types/result-status";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {mapResultExtensionsToErrorMessage} from "../common/helpers/map-result-extensions-to-error-message";
import {ApiErrorResult} from "../common/types/input-output-types/api-error-result";
import {IdType} from "../common/types/input-output-types/id-type";
import {UserInputModel, UserMeViewModel} from "../04-users/types/input-output-types";
import {LoginSuccessViewModel} from "./types/login-success-view-model";
import {SETTINGS} from "../common/settings";
import {RegistrationConfirmationCodeModel} from "./types/registration-confirmation-code-model";
import {RegistrationEmailResendingType} from "./types/registration-email-resending-type";
import {usersQueryRepository} from "../04-users/repositoryes/users-query-repository";
import {AuthTokens} from "./types/auth-tokens-type";
import {jwtService} from "./adapters/jwt-service";
import {ActiveSessionType} from "../02-sessions/types/active-session-type";
import {sessionsService} from "../02-sessions/domain/sessions-service";
import {TokenSessionDataType} from "../02-sessions/types/token-session-data-type";
import {sessionsRepository} from "../02-sessions/repositories/sessions-repository";
import {WithId} from "mongodb";

class AuthController {

    async login(
        req: RequestWithBody<LoginInputModel>,
        res: Response<ApiErrorResult | LoginSuccessViewModel>
    ) {

        const authParams: LoginInputModel = {
            loginOrEmail: req.body.loginOrEmail,
            password: req.body.password,
        };

        const resultLogin: ResultType<AuthTokens | null> = await authService
            .login(authParams);

        if (resultLogin.status !== ResultStatus.Success) {

            res
                .status(mapResultStatusToHttpStatus(resultLogin.status))
                .json(mapResultExtensionsToErrorMessage(resultLogin.extensions));

            return;
        }

        const deviceName: string = req.headers['user-agent'] || 'Unknown device';

        const ip: string = req.headers['x-forwarded-for']?.toString().split(',')[0]
            || req.socket.remoteAddress
            || '0.0.0.0';

        const payload = await jwtService
            .decodeToken(resultLogin.data!.refreshToken);

        const {
            userId,
            deviceId,
            iat,
            exp
        } = payload;

        const newSession: ActiveSessionType = {
            userId,
            deviceId,
            deviceName,
            ip,
            iat: new Date(iat * 1000).toISOString(),
            exp
        };

        await sessionsService
            .createSession(newSession);

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
    }

    async logout(
        req: RequestWithSession<TokenSessionDataType>,
        res: Response
    ){

        if (!req.session) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
        }

        const {
            iat,
            deviceId
        } = req.session!;

        const session: WithId<ActiveSessionType> | null = await sessionsRepository
            .findSessionByIatAndDeviceId(iat, deviceId);

        if (!session) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);

            return;
        }

        await sessionsService
            .deleteSession(String(session._id));

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }

    async refreshToken(
        req: RequestWithSession<TokenSessionDataType>,
        res: Response<ApiErrorResult | LoginSuccessViewModel>
    ){

        const dataForRefreshToken: TokenSessionDataType = {
            iat: req.session!.iat,
            userId: req.session!.userId,
            deviceId: req.session!.deviceId
        };

        const resultRefreshToken: ResultType<AuthTokens | null> = await authService
            .refreshToken(dataForRefreshToken);

        if (resultRefreshToken.status !== ResultStatus.Success) {

            res
                .status(mapResultStatusToHttpStatus(resultRefreshToken.status))
                .json(mapResultExtensionsToErrorMessage(resultRefreshToken.extensions));

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .cookie(
                'refreshToken',
                resultRefreshToken.data!.refreshToken,
                {httpOnly: true, secure: true,}
            )
            .json({accessToken: resultRefreshToken.data!.accessToken});
    }

    async registration(
        req: RequestWithBody<UserInputModel>,
        res: Response
    ){

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
    }

    async registrationConfirmation(
        req: RequestWithBody<RegistrationConfirmationCodeModel>,
        res: Response
    ){

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
    }

    async registrationEmailResending(
        req: RequestWithBody<RegistrationEmailResendingType>,
        res: Response
    ){

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
    }

    async me(
        req: RequestWithUserId<IdType>,
        res: Response<UserMeViewModel>
    ){

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
    }
}


// const authController = {
//
//     login: async (
//         req: RequestWithBody<LoginInputModel>,
//         res: Response<ApiErrorResult | LoginSuccessViewModel>
//     ) => {
//
//         const authParams: LoginInputModel = {
//             loginOrEmail: req.body.loginOrEmail,
//             password: req.body.password,
//         };
//
//         const resultLogin: ResultType<AuthTokens | null> = await authService
//             .login(authParams);
//
//         if (resultLogin.status !== ResultStatus.Success) {
//
//             res
//                 .status(mapResultStatusToHttpStatus(resultLogin.status))
//                 .json(mapResultExtensionsToErrorMessage(resultLogin.extensions));
//
//             return;
//         }
//
//         const deviceName: string = req.headers['user-agent'] || 'Unknown device';
//
//         const ip: string = req.headers['x-forwarded-for']?.toString().split(',')[0]
//             || req.socket.remoteAddress
//             || '0.0.0.0';
//
//         const payload = await jwtService
//             .decodeToken(resultLogin.data!.refreshToken);
//
//         const {
//             userId,
//             deviceId,
//             iat,
//             exp
//         } = payload;
//
//         const newSession: ActiveSessionType = {
//             userId,
//             deviceId,
//             deviceName,
//             ip,
//             iat: new Date(iat * 1000).toISOString(),
//             exp
//         };
//
//         await sessionsService
//             .createSession(newSession);
//
//         const {
//             accessToken,
//             refreshToken
//         } = resultLogin.data!;
//
//         res
//             .status(mapResultStatusToHttpStatus(resultLogin.status))
//             .cookie(
//                 'refreshToken',
//                 refreshToken,
//                 {httpOnly: true, secure: true,}
//             )
//             .json({accessToken});
//     },
//
//     logout: async (
//         req: RequestWithSession<TokenSessionDataType>,
//         res: Response
//     ) => {
//
//         if (!req.session) {
//
//             res
//                 .sendStatus(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
//         }
//
//         const {
//             iat,
//             deviceId
//         } = req.session!;
//
//         const session: WithId<ActiveSessionType> | null = await sessionsRepository
//             .findSessionByIatAndDeviceId(iat, deviceId);
//
//         if (!session) {
//
//             res
//                 .sendStatus(SETTINGS.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);
//
//             return;
//         }
//
//         await sessionsService
//             .deleteSession(String(session._id));
//
//         res
//             .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
//     },
//
//     refreshToken: async (
//         req: RequestWithSession<TokenSessionDataType>,
//         res: Response<ApiErrorResult | LoginSuccessViewModel>
//     ) => {
//
//         const dataForRefreshToken: TokenSessionDataType = {
//             iat: req.session!.iat,
//             userId: req.session!.userId,
//             deviceId: req.session!.deviceId
//         };
//
//         const resultRefreshToken: ResultType<AuthTokens | null> = await authService
//             .refreshToken(dataForRefreshToken);
//
//         if (resultRefreshToken.status !== ResultStatus.Success) {
//
//             res
//                 .status(mapResultStatusToHttpStatus(resultRefreshToken.status))
//                 .json(mapResultExtensionsToErrorMessage(resultRefreshToken.extensions));
//
//             return;
//         }
//
//         res
//             .status(SETTINGS.HTTP_STATUSES.OK_200)
//             .cookie(
//                 'refreshToken',
//                 resultRefreshToken.data!.refreshToken,
//                 {httpOnly: true, secure: true,}
//             )
//             .json({accessToken: resultRefreshToken.data!.accessToken});
//     },
//
//     registration: async (
//         req: RequestWithBody<UserInputModel>,
//         res: Response
//     ) => {
//
//         const dataForRegistrationUser: UserInputModel = {
//             login: req.body.login,
//             email: req.body.email,
//             password: req.body.password
//         };
//
//         const resultRegistration: ResultType<string | null> = await authService
//             .registration(dataForRegistrationUser);
//
//         if (resultRegistration.status !== ResultStatus.Success) {
//
//             res
//                 .status(mapResultStatusToHttpStatus(resultRegistration.status))
//                 .json(mapResultExtensionsToErrorMessage(resultRegistration.extensions));
//
//             return;
//         }
//
//         res
//             .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
//     },
//
//     registrationConfirmation: async (
//         req: RequestWithBody<RegistrationConfirmationCodeModel>,
//         res: Response
//     ) => {
//
//         const {code} = req.body
//
//         const resultRegistrationConfirmation: ResultType = await authService
//             .registrationConfirmation(code);
//
//         if (resultRegistrationConfirmation.status !== ResultStatus.Success) {
//
//             res
//                 .status(mapResultStatusToHttpStatus(resultRegistrationConfirmation.status))
//                 .json(mapResultExtensionsToErrorMessage(resultRegistrationConfirmation.extensions));
//
//             return;
//         }
//
//         res
//             .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
//     },
//
//     registrationEmailResending: async (
//         req: RequestWithBody<RegistrationEmailResendingType>,
//         res: Response
//     ) => {
//
//         const {email} = req.body;
//
//         const resultEmailResending = await authService
//             .registrationEmailResending(email);
//
//         if (resultEmailResending.status !== ResultStatus.Success) {
//
//             res
//                 .status(mapResultStatusToHttpStatus(resultEmailResending.status))
//                 .json(mapResultExtensionsToErrorMessage(resultEmailResending.extensions));
//
//             return;
//         }
//
//         res
//             .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
//     },
//
//     me: async (
//         req: RequestWithUserId<IdType>,
//         res: Response<UserMeViewModel>
//     ) => {
//
//         const userId: string = String(req.user?.id);
//
//         if (!userId) {
//
//             res
//                 .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
//         }
//
//         const me: UserMeViewModel | null = await usersQueryRepository
//             .findUserAndMapToMeViewModel(userId);
//
//         res
//             .status(SETTINGS.HTTP_STATUSES.OK_200)
//             .json(me!);
//     },
// };

export {AuthController};