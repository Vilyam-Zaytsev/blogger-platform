import {BcryptService} from "../adapters/bcrypt-service";
import {LoginInputModel} from "../types/login-input-model";
import {ConfirmationStatus} from "../../04-users/types/confirmation-status";
import {UsersRepository} from "../../04-users/repositoryes/users-repository";
import {ResultStatus} from "../../common/types/result-types/result-status";
import {ResultType} from "../../common/types/result-types/result-type";
import {JwtService} from "../adapters/jwt-service";
import {ObjectId, WithId} from "mongodb";
import {UsersService} from "../../04-users/domain/users-service";
import {User} from "../../04-users/domain/user.entity";
import {nodemailerService} from "../adapters/nodemailer-service";
import {EmailTemplates} from "../adapters/email-templates";
import {randomUUID} from "node:crypto";
import {add} from "date-fns";
import {UserInputModel} from "../../04-users/types/input-output-types";
import {
    BadRequestResult,
    InternalServerErrorResult,
    NotFoundResult,
    SuccessResult,
    UnauthorizedResult
} from "../../common/helpers/result-object";
import {AuthTokens} from "../types/auth-tokens-type";
import {ActiveSessionType} from "../../02-sessions/types/active-session-type";
import {PayloadRefreshTokenType} from "../types/payload.refresh.token.type";
import {SessionsRepository} from "../../02-sessions/repositories/sessions-repository";
import {TokenSessionDataType} from "../../02-sessions/types/token-session-data-type";
import {SessionTimestampsType} from "../../02-sessions/types/session-timestamps-type";

class AuthService {

    constructor(
        private bcryptService: BcryptService = new BcryptService(),
        private jwtService: JwtService = new JwtService(),
        private emailTemplates: EmailTemplates = new EmailTemplates(),
        private sessionsRepository: SessionsRepository = new SessionsRepository(),
        private usersService: UsersService = new UsersService(),
        private usersRepository: UsersRepository = new UsersRepository()
    ) {};

    async login(authParamsDto: LoginInputModel): Promise<ResultType<AuthTokens | null>> {

        const {
            data: checkedUserId,
            status: userVerificationStatus
        }: ResultType<string | null> = await this.checkUserCredentials(authParamsDto);

        if (userVerificationStatus !== ResultStatus.Success) {

            return UnauthorizedResult
                .create(
                    'loginOrEmailOrPassword',
                    'Login, email or password incorrect.',
                    'The user did not pass the verification of credentials.'
                );
        }

        const accessToken: string = await this.jwtService
            .createAccessToken(checkedUserId!);

        const deviceId: ObjectId = new ObjectId();

        const refreshToken: string = await this.jwtService
            .createRefreshToken(
                checkedUserId!,
                deviceId
            );

        return SuccessResult
            .create<AuthTokens>({accessToken, refreshToken});
    }

    async refreshToken(tokenData: TokenSessionDataType) {

        const {
            userId,
            deviceId
        } = tokenData;

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.createAccessToken(userId),
            this.jwtService.createRefreshToken(userId, deviceId)
        ]);

        //TODO: что если переделать поиск сессии только по deviceId???
        const [payloadRefreshToken, session] = await Promise.all([
            this.jwtService.decodeToken(refreshToken),
            this.sessionsRepository.findSessionByDeviceId(deviceId)
        ]);

        const timestamps: SessionTimestampsType = {
            iat: new Date(payloadRefreshToken.iat * 1000),
            exp: new Date(payloadRefreshToken.exp * 1000)
        };

        const resultUpdateSessionTimestamps: boolean = await this.sessionsRepository
            .updateSessionTimestamps(session!._id, timestamps);

        if (!resultUpdateSessionTimestamps) {

            return InternalServerErrorResult
                .create(
                    'iat, exp',
                    'Failed to update session timestamps.',
                    'Failed to refresh the token pair.'
                );
        }

        return SuccessResult
            .create<AuthTokens>({accessToken, refreshToken});

    }

    async registration(registrationUserDto: UserInputModel): Promise<ResultType<string | null>> {

        const candidate: User = await User
            .registrationUser(registrationUserDto);

        const resultCreateUser: ResultType<string | null> = await this.usersService
            .createUser(candidate);

        if (resultCreateUser.status !== ResultStatus.Success) return resultCreateUser;

        nodemailerService
            .sendEmail(
                candidate.email,
                this.emailTemplates
                    .registrationEmail(candidate.emailConfirmation.confirmationCode!)
            )
            .catch(error => console.error('ERROR IN SEND EMAIL:', error));

        return SuccessResult
            .create(null);
    }

    async registrationConfirmation(confirmationCode: string): Promise<ResultType> {

        const user: WithId<User> | null = await this.usersRepository
            .findByConfirmationCode(confirmationCode);


        if (!user) {

            return BadRequestResult
                .create(
                    'code',
                    'Confirmation code incorrect.',
                    'Failed to complete user registration.'
                );
        }

        if (user.emailConfirmation.confirmationStatus === ConfirmationStatus.Confirmed) {

            return BadRequestResult
                .create(
                    'code',
                    'The confirmation code has already been used. The account has already been verified.',
                    'Failed to complete user registration.'
                );
        }

        if (user.emailConfirmation.expirationDate && user.emailConfirmation.expirationDate < new Date()) {

            return BadRequestResult
                .create(
                    'code',
                    'The code has expired.',
                    'Failed to complete user registration.'
                );
        }

        await this.usersRepository
            .updateConfirmationStatus(user._id);

        return SuccessResult
            .create(null);
    }

    async registrationEmailResending(email: string): Promise<ResultType> {

        const user: WithId<User> | null = await this.usersRepository
            .findByEmail(email);

        if (!user) {

            return BadRequestResult
                .create(
                    'email',
                    'There is no user with this email address.',
                    'Couldn\'t send an email with a confirmation code.'
                );
        }

        if (user.emailConfirmation.confirmationStatus === ConfirmationStatus.Confirmed) {

            return BadRequestResult
                .create(
                    'email',
                    'The user have already confirmed their credentials.',
                    'Couldn\'t send an email with a confirmation code.'
                );
        }

        const confirmationCode: string = randomUUID();
        const expirationDate: Date = add(
            new Date(),
            {hours: 1, minutes: 1}
        );

        await this.usersRepository
            .updateEmailConfirmation(
                user._id,
                confirmationCode,
                expirationDate);

        nodemailerService
            .sendEmail(
                user.email,
                this.emailTemplates
                    .registrationEmail(confirmationCode)
            )
            .catch(error => console.error('ERROR IN SEND EMAIL:', error));

        return SuccessResult
            .create(null);
    }

    async checkUserCredentials(authParamsDto: LoginInputModel): Promise<ResultType<string | null>> {
        const {
            loginOrEmail,
            password
        } = authParamsDto;

        const user: WithId<User> | null = await this.usersRepository
            .findByLoginOrEmail(loginOrEmail);

        if (!user) {

            return BadRequestResult
                .create(
                    'loginOrEmail',
                    'There is no user with such data.',
                    'The credentials failed verification.'
                );
        }

        const isPasswordCorrect: boolean = await this.bcryptService
            .checkPassword(password, user.passwordHash);

        if (!isPasswordCorrect) {

            return BadRequestResult
                .create(
                    'password',
                    'Incorrect password.',
                    'The credentials failed verification.'
                );
        }

        return SuccessResult
            .create<string>(String(user._id));
    }

    async checkAccessToken(token: string): Promise<ResultType<string | null>> {

        const payload = await this.jwtService
            .verifyAccessToken(token);

        if (!payload) {

            return BadRequestResult
                .create(
                    'token',
                    'Payload incorrect.',
                    'Access token failed verification.'
                );
        }

        const {userId} = payload;

        const isUser: User | null = await this.usersRepository
            .findUser(userId);

        if (!isUser) {

            return NotFoundResult
                .create(
                    'userId',
                    'A user with this ID was not found.',
                    'Access token failed verification.'
                );
        }

        return SuccessResult
            .create<string>(userId);
    }

    async checkRefreshToken(refreshToken: string): Promise<ResultType<PayloadRefreshTokenType | null>> {

        const payload: PayloadRefreshTokenType | null = await this.jwtService
            .verifyRefreshToken(refreshToken);

        if (!payload) {

            return BadRequestResult
                .create(
                    'token',
                    'Payload incorrect.',
                    'Refresh token failed verification.'
                );
        }

        const {
            userId,
            deviceId,
        } = payload;

        const isUser: User | null = await this.usersRepository
            .findUser(userId);

        if (!isUser) {

            return BadRequestResult
                .create(
                    'token',
                    'Payload incorrect.',
                    'Refresh token failed verification.'
                );
        }

        const isSessionActive: WithId<ActiveSessionType> | null = await this.sessionsRepository
            .findSessionByDeviceId(new ObjectId(deviceId));

        if (!isSessionActive) {

            return BadRequestResult
                .create(
                    'token',
                    'Payload incorrect.',
                    'Refresh token failed verification.'
                );
        }

        return SuccessResult
            .create<PayloadRefreshTokenType>(payload);
    }

    async passwordRecovery(email: string): Promise<ResultType> {

        const user: WithId<User> | null = await this.usersRepository
            .findByEmail(email);

        if (!user) {

            return SuccessResult
                .create(null);
        }

        const recoveryCode: string = randomUUID();
        const expirationDate: Date = add(
            new Date(),
            {hours: 1, minutes: 1}
        )

        await this.usersRepository
            .updatePasswordRecovery(
                user._id,
                recoveryCode,
                expirationDate);

        nodemailerService
            .sendEmail(
                user.email,
                this.emailTemplates
                    .passwordRecoveryEmail(recoveryCode)
            )
            .catch(error => console.error('ERROR IN SEND EMAIL:', error));

        return SuccessResult
            .create(null);
    }

    async newPassword(newPassword: string, recoveryCode: string): Promise<ResultType> {

        const user: WithId<User> | null = await this.usersRepository
            .findByRecoveryCode(recoveryCode);


        if (!user) {

            return BadRequestResult
                .create(
                    'recoveryCode',
                    'Recovery code incorrect.',
                    'The password could not be recovered.'
                );
        }

        if (user.passwordRecovery.expirationDate && user.passwordRecovery.expirationDate < new Date()) {

            return BadRequestResult
                .create(
                    'code',
                    'The code has expired.',
                    'The password could not be recovered.'
                );
        }

        const passwordHash: string = await this.bcryptService
            .generateHash(newPassword);

        const resultUpdatePassword: boolean = await this.usersRepository
            .updatePassword(user._id, passwordHash);

        if (!resultUpdatePassword) {

            return InternalServerErrorResult
                .create(
                    'no field',
                    'Server Error.',
                    'The password could not be updated.'
                );
        }

        return SuccessResult
            .create(null);
    }
}

export {AuthService};