import {bcryptService} from "../adapters/bcrypt-service";
import {LoginInputModel} from "../types/login-input-model";
import {ConfirmationStatus, UserDbType} from "../../03-users/types/user-db-type";
import {usersRepository} from "../../03-users/repositoryes/users-repository";
import {ResultStatus} from "../../common/types/result-types/result-status";
import {ResultType} from "../../common/types/result-types/result-type";
import {jwtService} from "../adapters/jwt-service";
import {WithId} from "mongodb";
import {usersService} from "../../03-users/users-service";
import {User} from "../../03-users/domain/user.entity";
import {nodemailerService} from "../adapters/nodemailer-service";
import {emailTemplates} from "../adapters/email-templates";
import {randomUUID} from "node:crypto";
import {add} from "date-fns";
import {UserInputModel} from "../../03-users/types/input-output-types";
import {BadRequestResult, NotFoundResult, SuccessResult, UnauthorizedResult} from "../../common/helpers/result-object";
import {AuthTokens} from "../types/auth-tokens-type";
import {SessionModel} from "../../02-sessions/types/session-model";
import {authRepository} from "../auth-repository";
import {PayloadRefreshTokenType} from "../types/payload.refresh.token.type";

const authService = {

    async login(authParamsDto: LoginInputModel): Promise<ResultType<AuthTokens | null>> {

        const resultCheckUserCredentials: ResultType<string | null> = await this.checkUserCredentials(authParamsDto);

        if (resultCheckUserCredentials.status !== ResultStatus.Success) {

            return UnauthorizedResult
                .create(
                    'loginOrEmailOrPassword',
                    'Login, email or password incorrect.',
                    'The user did not pass the verification of credentials.'
                );
        }

        const accessToken: string = await jwtService
            .createAccessToken(resultCheckUserCredentials.data!);

        const deviceId: string = randomUUID();

        const refreshToken: string = await jwtService
            .createRefreshToken(
                resultCheckUserCredentials.data!,
                deviceId
            );

        return SuccessResult
            .create<AuthTokens>({accessToken, refreshToken});
    },

    async registration(registrationUserDto: UserInputModel): Promise<ResultType<string | null>> {

        const candidate: UserDbType = await User
            .registrationUser(registrationUserDto);

        const resultCreateUser: ResultType<string | null> = await usersService
            .createUser(candidate);

        if (resultCreateUser.status !== ResultStatus.Success) return resultCreateUser;

        nodemailerService
            .sendEmail(
                candidate.email,
                emailTemplates
                    .registrationEmail(candidate.emailConfirmation.confirmationCode!)
            )
            .catch(error => console.error('ERROR IN SEND EMAIL:', error));

        return SuccessResult
            .create(null);
    },

    async registrationConfirmation(confirmationCode: string): Promise<ResultType> {

        const user: WithId<UserDbType> | null = await usersRepository
            .findByConfirmationCode(confirmationCode);


        if (!user) {

            return BadRequestResult
                .create(
                    'code',
                    'Confirmation code incorrect.',
                    'Failed to complete user registration.'
                );
        }

        //TODO:  Эта проверка лишняя???

        // if (user.emailConfirmation.confirmationCode !== confirmationCode) return BadRequestResult
        //     .create(
        //         'code',
        //         'Confirmation code incorrect.',
        //         'Registration could not be confirmed.'
        //     );

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

        await usersRepository
            .updateConfirmationStatus(user._id);

        return SuccessResult
            .create(null);
    },

    async registrationEmailResending(email: string): Promise<ResultType> {

        const user: WithId<UserDbType> | null = await usersRepository
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

        await usersRepository
            .updateEmailConfirmation(
                user._id,
                confirmationCode,
                expirationDate);

        nodemailerService
            .sendEmail(
                user.email,
                emailTemplates
                    .registrationEmail(confirmationCode)
            )
            .catch(error => console.error('ERROR IN SEND EMAIL:', error));

        return SuccessResult
            .create(null);
    },

    async checkUserCredentials(authParamsDto: LoginInputModel): Promise<ResultType<string | null>> {
        const {
            loginOrEmail,
            password
        } = authParamsDto;

        const user: WithId<UserDbType> | null = await usersRepository
            .findByLoginOrEmail(loginOrEmail);

        if (!user) {

            return BadRequestResult
                .create(
                    'loginOrEmail',
                    'There is no user with such data.',
                    'The credentials failed verification.'
                );
        }

        const isPasswordCorrect: boolean = await bcryptService
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
    },

    async checkAccessToken(authHeader: string): Promise<ResultType<string | null>> {

        const token: string = authHeader.split(' ')[1];

        const payload = await jwtService
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

        const isUser: UserDbType | null = await usersRepository
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
    },

    async checkRefreshToken(refreshToken: string): Promise<ResultType<PayloadRefreshTokenType | null>> {

        const payload: PayloadRefreshTokenType | null = await jwtService
            .verifyRefreshToken(refreshToken);

        if (!payload) {

            return BadRequestResult
                .create(
                    'token',
                    'Payload incorrect.',
                    'Refresh token failed verification.'
                );
        }

        //TODO: есть ли необходимость проверять сессию???

        const {userId} = payload;

        const isUser: UserDbType | null = await usersRepository
            .findUser(userId);

        if (!isUser) {

            return NotFoundResult
                .create(
                    'userId',
                    'A user with this ID was not found.',
                    'Refresh token failed verification.'
                );
        }

        return SuccessResult
            .create<PayloadRefreshTokenType>(payload);
    },

    async revokeRefreshToken(refreshToken: string): Promise<ResultType<string | null>> {

        const decodedToken: any = await jwtService
            .decodeToken(refreshToken);

        const revokedToken: SessionModel = {
            refreshToken,
            userId: decodedToken.userId,
            revokedAt: new Date(),
            expiresAt: new Date(decodedToken.exp * 1000)
        };

        const resultAddingTokenToBlacklist = await authRepository
            .addTokenToBlacklist(revokedToken);

        return SuccessResult
            .create<string>(String(resultAddingTokenToBlacklist));
    }
};

export {authService};