import {BcryptService} from "../adapters/bcrypt-service";
import {LoginInputModel} from "../types/login-input-model";
import {UsersRepository} from "../../04-users/repositoryes/users-repository";
import {ResultStatus} from "../../common/types/result-types/result-status";
import {ResultType} from "../../common/types/result-types/result-type";
import {JwtService} from "../adapters/jwt-service";
import {ObjectId, WithId} from "mongodb";
import {UsersService} from "../../04-users/application/users-service";
import {User} from "../../04-users/domain/user-entity";
import {nodemailerService} from "../adapters/nodemailer-service";
import {EmailTemplates} from "../adapters/email-templates";
import {randomUUID} from "node:crypto";
import {add} from "date-fns";
import {
    BadRequestResult,
    InternalServerErrorResult,
    NotFoundResult,
    SuccessResult,
    UnauthorizedResult
} from "../../common/helpers/result-object";
import {AuthTokens} from "../types/auth-tokens-type";
import {PayloadRefreshTokenType} from "../types/payload.refresh.token.type";
import {SessionsRepository} from "../../02-sessions/repositories/sessions-repository";
import {TokenSessionDataType} from "../../02-sessions/types/token-session-data-type";
import {SessionTimestampsType} from "../../02-sessions/types/session-timestamps-type";
import {injectable} from "inversify";
import {SessionDocument} from "../../02-sessions/domain/session-entity";
import {ConfirmationStatus, UserDocument} from "../../archive/models/user-model";
import {UserDto} from "../../04-users/domain/user-dto";
import {isSuccess, isSuccessfulResult} from "../../common/helpers/type-guards";

@injectable()
class AuthService {

    constructor(
        private bcryptService: BcryptService,
        private jwtService: JwtService,
        private emailTemplates: EmailTemplates,
        private sessionsRepository: SessionsRepository,
        private usersService: UsersService,
        private usersRepository: UsersRepository
    ) {
    };

    async login(authParamsDto: LoginInputModel): Promise<ResultType<AuthTokens | null>> {

        const {
            status: userVerificationStatus,
            data: checkedUserId
        }: ResultType<string | null> = await this.checkUserCredentials(authParamsDto);

        if (!isSuccessfulResult(userVerificationStatus, checkedUserId)) {

            return UnauthorizedResult
                .create(
                    'loginOrEmailOrPassword',
                    'Login, email or password incorrect.',
                    'The user did not pass the verification of credentials.'
                );
        }

        const accessToken: string = await this.jwtService
            .createAccessToken(checkedUserId);

        const deviceId: ObjectId = new ObjectId();

        const refreshToken: string = await this.jwtService
            .createRefreshToken(
                checkedUserId,
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

        const [
            accessToken,
            refreshToken
        ] = await Promise.all([
            this.jwtService.createAccessToken(userId),
            this.jwtService.createRefreshToken(userId, deviceId)
        ]);

        //TODO: как правильно написать типизацию???
        const [
            payloadRefreshToken,
            session
        ]: [PayloadRefreshTokenType, SessionDocument] = await Promise.all([
            this.jwtService.decodeToken(refreshToken),
            this.sessionsRepository.findSessionByDeviceId(deviceId)
        ]);

        const timestamps: SessionTimestampsType = {
            iat: new Date(payloadRefreshToken.iat * 1000),
            exp: new Date(payloadRefreshToken.exp * 1000)
        };

        session.updateTimestamps(timestamps);

        await this.sessionsRepository
            .saveSession(session);

        return SuccessResult
            .create<AuthTokens>({accessToken, refreshToken});

    }

    async registration(userDto: UserDto): Promise<ResultType<string | null>> {

        const candidate: User = await User
            .registrationUser(userDto);

        const resultCreateUser: ResultType<string | null> = await this.usersService
            .createUser(candidate);

        if (!isSuccess(resultCreateUser)) {

            return resultCreateUser;
        }

        nodemailerService
            .sendEmail(
                candidate.email,
                this.emailTemplates
                    .registrationEmail(candidate.emailConfirmation!.confirmationCode!)
            )
            .catch(error => console.error('ERROR IN SEND EMAIL:', error));

        return SuccessResult
            .create(null);
    }

    async registrationConfirmation(confirmationCode: string): Promise<ResultType> {

        const userDocument: UserDocument | null = await this.usersRepository
            .findByConfirmationCode(confirmationCode);


        if (!userDocument) {

            return BadRequestResult
                .create(
                    'code',
                    'Confirmation code incorrect.',
                    'Failed to complete user registration.'
                );
        }

        if (
            userDocument.emailConfirmation
            && userDocument.emailConfirmation.expirationDate
            && userDocument.emailConfirmation.expirationDate < new Date()
        ) {

            return BadRequestResult
                .create(
                    'code',
                    'The code has expired.',
                    'Failed to complete user registration.'
                );
        }

        userDocument.emailConfirmation!.confirmationStatus = ConfirmationStatus.Confirmed;
        userDocument.emailConfirmation!.confirmationCode = null;
        userDocument.emailConfirmation!.expirationDate = null;

        await this.usersRepository
            .saveUser(userDocument);

        return SuccessResult
            .create(null);
    }

    async registrationEmailResending(email: string): Promise<ResultType> {

        const userDocument: UserDocument | null = await this.usersRepository
            .findByEmail(email);

        if (!userDocument) {

            return BadRequestResult
                .create(
                    'email',
                    'There is no user with this email address.',
                    'Couldn\'t send an email with a confirmation code.'
                );
        }

        if (
            userDocument.emailConfirmation
            && userDocument.emailConfirmation.confirmationStatus === ConfirmationStatus.Confirmed
        ) {

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

        userDocument.emailConfirmation!.confirmationCode = confirmationCode;
        userDocument.emailConfirmation!.expirationDate = expirationDate;

        await this.usersRepository
            .saveUser(userDocument);

        nodemailerService
            .sendEmail(
                userDocument.email,
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
            .findUserById(userId);

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
            .findUserById(userId);

        if (!isUser) {

            return BadRequestResult
                .create(
                    'token',
                    'Payload incorrect.',
                    'Refresh token failed verification.'
                );
        }

        const isSessionActive: SessionDocument | null = await this.sessionsRepository
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

        const userDocument: UserDocument | null = await this.usersRepository
            .findByEmail(email);

        if (!userDocument) {

            return SuccessResult
                .create(null);
        }

        const recoveryCode: string = randomUUID();
        const expirationDate: Date = add(
            new Date(),
            {hours: 1, minutes: 1}
        )

        userDocument.passwordRecovery!.recoveryCode = recoveryCode;
        userDocument.passwordRecovery!.expirationDate = expirationDate;

        await this.usersRepository
            .saveUser(userDocument);

        nodemailerService
            .sendEmail(
                userDocument.email,
                this.emailTemplates
                    .passwordRecoveryEmail(recoveryCode)
            )
            .catch(error => console.error('ERROR IN SEND EMAIL:', error));

        return SuccessResult
            .create(null);
    }

    async newPassword(newPassword: string, recoveryCode: string): Promise<ResultType> {

        const user: WithId<UserDocument> | null = await this.usersRepository
            .findByRecoveryCode(recoveryCode);


        if (!user) {

            return BadRequestResult
                .create(
                    'recoveryCode',
                    'Recovery code incorrect.',
                    'The password could not be recovered.'
                );
        }

        if (
            user.passwordRecovery
            && user.passwordRecovery.expirationDate
            && user.passwordRecovery.expirationDate < new Date()
        ) {

            return BadRequestResult
                .create(
                    'code',
                    'The code has expired.',
                    'The password could not be recovered.'
                );
        }

        const passwordHash: string = await this.bcryptService
            .generateHash(newPassword);

        user.passwordHash = passwordHash
        user.passwordRecovery = null
        await this.usersRepository.saveUser(user)

        return SuccessResult
            .create(null);
    }
}

export {AuthService};