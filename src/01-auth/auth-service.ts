import {bcryptService} from "../common/adapters/bcrypt-service";
import {LoginInputModel} from "./types/login-input-model";
import {ConfirmationStatus, UserDbType} from "../02-users/types/user-db-type";
import {usersRepository} from "../02-users/repositoryes/users-repository";
import {ResultStatus} from "../common/types/result-types/result-status";
import {ResultType} from "../common/types/result-types/result-type";
import {jwtService} from "../common/adapters/jwt-service";
import {WithId} from "mongodb";
import {LoginSuccessViewModel} from "./types/login-success-view-model";
import {usersService} from "../02-users/users-service";
import {User} from "../02-users/domain/user.entity";
import {nodemailerService} from "../common/adapters/nodemailer-service";
import {emailTemplates} from "../common/adapters/email-templates";
import {randomUUID} from "node:crypto";
import {add} from "date-fns";
import {UserInputModel} from "../02-users/types/input-output-types";
import {BadRequestResult, SuccessResult, UnauthorizedResult} from "../common/helpers/result-object";
import {AuthTokens} from "./types/auth-tokens-type";

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

        const refreshToken: string = await jwtService
            .createRefreshToken(resultCheckUserCredentials.data!);

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
    }
};

export {authService};