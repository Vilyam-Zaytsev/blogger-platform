import {Response} from "express";
import {RequestWithBody, RequestWithSession, RequestWithUserId} from "../common/types/input-output-types/request-types";
import {LoginInputModel} from "./types/login-input-model";
import {AuthService} from "./domain/auth-service";
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
import {UsersQueryRepository} from "../04-users/repositoryes/users-query-repository";
import {AuthTokens} from "./types/auth-tokens-type";
import {JwtService} from "./adapters/jwt-service";
import {SessionsService} from "../02-sessions/domain/sessions-service";
import {TokenSessionDataType} from "../02-sessions/types/token-session-data-type";
import {SessionsRepository} from "../02-sessions/repositories/sessions-repository";
import {ObjectId, WithId} from "mongodb";
import {PasswordRecoveryInputModel} from "./types/password-recovery-input-model";
import {NewPasswordRecoveryInputModel} from "./types/new-password-recovery-input-model";
import {injectable} from "inversify";
import {Session} from "../02-sessions/domain/session-entity";

const jwtService: JwtService = new JwtService();

@injectable()
class AuthController {

    constructor(
        private authService: AuthService,
        private sessionsService: SessionsService,
        private sessionsRepository: SessionsRepository,
        private usersQueryRepository: UsersQueryRepository
    ) {};

    async login(
        req: RequestWithBody<LoginInputModel>,
        res: Response<ApiErrorResult | LoginSuccessViewModel>
    ) {

        const authParams: LoginInputModel = {
            loginOrEmail: req.body.loginOrEmail,
            password: req.body.password,
        };

        const {
            status: loginResultStatus,
            extensions: errorDetails,
            data: authTokens
        }: ResultType<AuthTokens | null> = await this.authService
            .login(authParams);

        if (loginResultStatus !== ResultStatus.Success) {

            res
                .status(mapResultStatusToHttpStatus(loginResultStatus))
                .json(mapResultExtensionsToErrorMessage(errorDetails));

            return;
        }

        const deviceName: string = req.headers['user-agent'] || 'Unknown device';

        const ip: string = req.headers['x-forwarded-for']?.toString().split(',')[0]
            || req.socket.remoteAddress
            || '0.0.0.0';

        const payload = await jwtService
            .decodeToken(authTokens!.refreshToken);

        const {
            userId,
            deviceId,
            iat,
            exp
        } = payload;

        const sessionDto: Session = new Session(
            userId,
            new ObjectId(deviceId),
            deviceName,
            ip,
            new Date(iat * 1000),
            new Date(exp * 1000)
        );

        await this.sessionsService
            .createSession(sessionDto);

        const {
            accessToken,
            refreshToken
        } = authTokens!;

        res
            .status(mapResultStatusToHttpStatus(loginResultStatus))
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
            deviceId
        } = req.session!;

        const session: WithId<Session> | null = await this.sessionsRepository
            .findSessionByDeviceId(deviceId);

        if (!session) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.INTERNAL_SERVER_ERROR_500);

            return;
        }

        await this.sessionsService
            .deleteSession(String(session._id));

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }

    async refreshToken(
        req: RequestWithSession<TokenSessionDataType>,
        res: Response<ApiErrorResult | LoginSuccessViewModel>
    ){

        const dataForRefreshToken: TokenSessionDataType = {
            userId: req.session!.userId,
            deviceId: req.session!.deviceId
        };

        const {
            status: refreshTokenResultStatus,
            extensions: errorDetails,
            data: authTokens
        }: ResultType<AuthTokens | null> = await this.authService
            .refreshToken(dataForRefreshToken);

        if (refreshTokenResultStatus !== ResultStatus.Success) {

            res
                .status(mapResultStatusToHttpStatus(refreshTokenResultStatus))
                .json(mapResultExtensionsToErrorMessage(errorDetails));

            return;
        }

        const {
            accessToken,
            refreshToken
        } = authTokens!;

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .cookie(
                'refreshToken',
                refreshToken,
                {httpOnly: true, secure: true,}
            )
            .json({accessToken});
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

        const resultRegistration: ResultType<string | null> = await this.authService
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

        const resultRegistrationConfirmation: ResultType = await this.authService
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

        const resultEmailResending = await this.authService
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

    async passwordRecovery(
        req: RequestWithBody<PasswordRecoveryInputModel>,
        res: Response
    ){

        const {email} = req.body;

        const resultPasswordRecovery: ResultType = await this.authService
            .passwordRecovery(email);

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }

    async newPassword(
        req: RequestWithBody<NewPasswordRecoveryInputModel>,
        res: Response
    ){

        const {
            newPassword,
            recoveryCode
        } = req.body;

        const resultNewPassword: ResultType = await this.authService
            .newPassword(newPassword, recoveryCode);

        if (resultNewPassword.status !== ResultStatus.Success) {

            res
                .status(mapResultStatusToHttpStatus(resultNewPassword.status))
                .json(mapResultExtensionsToErrorMessage(resultNewPassword.extensions));

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

        const me: UserMeViewModel | null = await this.usersQueryRepository
            .findUserAndMapToMeViewModel(userId);

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(me!);
    }
}

// const authController: AuthController = new AuthController();

export {AuthController};
// export {authController};