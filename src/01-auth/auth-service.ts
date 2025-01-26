import {bcryptService} from "../common/adapters/bcrypt-service";
import {LoginInputType} from "./types/login-input-type";
import {ConfirmationStatus, UserDbType} from "../02-users/types/user-db-type";
import {usersRepository} from "../02-users/repositoryes/users-repository";
import {ResultStatus} from "../common/types/result-types/result-status";
import {ResultType} from "../common/types/result-types/result-type";
import {jwtService} from "../common/adapters/jwt-service";
import {WithId} from "mongodb";
import {AccessTokenType} from "./types/access-token-type";
import {usersService} from "../02-users/services/users-service";
import {User} from "../02-users/domain/user.entity";
import {nodemailerService} from "../common/adapters/nodemailer-service";
import {emailTemplates} from "../common/adapters/email-templates";
import {randomUUID} from "node:crypto";
import {add} from "date-fns";

const authService = {

    async login(authParamsDto: LoginInputType): Promise<ResultType<AccessTokenType | null>> {

        const result: ResultType<WithId<UserDbType> | null> = await this.checkUserCredentials(authParamsDto);

        if (result.status !== ResultStatus.Success) {
            return {
                status: ResultStatus.Unauthorized,
                errorMessage: 'auth data incorrect',
                extensions: [{
                    field: 'loginOrEmailOrPassword',
                    message: 'Login, email or password incorrect.',
                }],
                data: null
            };
        }

        const accessToken: AccessTokenType = await jwtService
            .createToken(String(result.data!._id));

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: accessToken,
        }
    },

    async registration(
        login: string,
        password: string,
        email: string
    ): Promise<ResultType<string | null>> {

        const candidate: UserDbType = await User
            .registrationUser(login, email, password);

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

        return resultCreateUser;
    },

    async registrationConfirmation(confirmationCode: string): Promise<ResultType> {

        const user: WithId<UserDbType> | null = await usersRepository
            .findByConfirmationCode(confirmationCode);

        //TODO !!!!!!!!!!!!!!!!!!!!!переписать валидацию когда создам фабрики ResultObject!!!!!!!!!!!!!!!
        if (
            !user
            || user.emailConfirmation.confirmationStatus === ConfirmationStatus.Confirmed
            || user.emailConfirmation.confirmationCode !== confirmationCode
            || user.emailConfirmation.expirationDate && user.emailConfirmation.expirationDate < new Date()
        ) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'confirmation code invalid',
            extensions: [
                {
                    field: 'code',
                    message: 'Confirmation code invalid.'
                }
            ],
            data: null
        };

        const resultUpdateConfirmationStatus = await usersRepository
            .updateConfirmationStatus(user._id);

        if (!resultUpdateConfirmationStatus) return {
            status: ResultStatus.InternalServerError,
            errorMessage: 'server error',
            extensions: [
                {
                    field: 'confirmationStatus',
                    message: 'The confirmation status could not be updated. Server error.'
                }
            ],
            data: null
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null
        }
    },

    async registrationEmailResending(email: string): Promise<ResultType> {

        const user: WithId<UserDbType> | null = await usersRepository
            .findByEmail(email);

        //TODO !!!!!!!!!!!!!!!!!!!!!переписать валидацию когда создам фабрики ResultObject!!!!!!!!!!!!!!!
        if (!user) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'email incorrect',
            extensions: [
                {
                    field: 'email',
                    message: 'There is no user with this email address.'
                }
            ],
            data: null
        };

        if (user.emailConfirmation.confirmationStatus === ConfirmationStatus.Confirmed) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'the user\'s email has already been confirmed',
            extensions: [
                {
                    field: 'confirmationStatus',
                    message: 'The users have already confirmed their credentials.'
                }
            ],
            data: null
        };

        const confirmationCode: string = randomUUID();
        const expirationDate: Date = add(
            new Date(),
            {hours: 1, minutes: 1}
        );

        const resultUpdateEmailConfirmation = await usersRepository
            .updateEmailConfirmation(
                user._id,
                confirmationCode,
                expirationDate);

        if (!resultUpdateEmailConfirmation) return {
            status: ResultStatus.InternalServerError,
            errorMessage: 'server error',
            extensions: [
                {
                    field: 'emailConfirmation',
                    message: 'The confirmation code and  could not be updated. Server error.'
                }
            ],
            data: null
        };

       await nodemailerService
            .sendEmail(
                user.email,
                emailTemplates
                    .registrationEmail(confirmationCode)
            )
            .catch(error => console.error('ERROR IN SEND EMAIL:', error));

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null
        }
    },

    async checkUserCredentials(authParamsDto: LoginInputType): Promise<ResultType<WithId<UserDbType> | null>> {
        const {
            loginOrEmail,
            password
        } = authParamsDto;

        const isUser: WithId<UserDbType> | null = await usersRepository
            .findByLoginOrEmail(loginOrEmail);

        if (!isUser) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'loginOrEmail incorrect',
                extensions: [{
                    field: 'loginOrEmail',
                    message: 'There is no user with such data.',
                }],
                data: null
            };
        }

        const isPasswordCorrect: boolean = await bcryptService
            .checkPassword(password, isUser.passwordHash);

        if (!isPasswordCorrect) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'password incorrect',
                extensions: [{
                    field: 'password',
                    message: 'Invalid password.',
                }],
                data: null
            };
        }

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: isUser
        };
    }
};

export {authService};