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

const authService = {

    async login(authParamsDto: LoginInputModel): Promise<ResultType<LoginSuccessViewModel | null>> {

        const resultCheckUserCredentials: ResultType<string | null> = await this.checkUserCredentials(authParamsDto);

        if (resultCheckUserCredentials.status !== ResultStatus.Success) return {
            status: ResultStatus.Unauthorized,
            errorMessage: 'auth data incorrect',
            extensions: [{
                field: 'loginOrEmailOrPassword',
                message: 'Login, email or password incorrect.',
            }],
            data: null
        };

        const accessToken: LoginSuccessViewModel = await jwtService
            .createToken(resultCheckUserCredentials.data!);

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: accessToken,
        }
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

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: null
        };
    },

    async registrationConfirmation(confirmationCode: string): Promise<ResultType> {

        const user: WithId<UserDbType> | null = await usersRepository
            .findByConfirmationCode(confirmationCode);


        if (!user) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'confirmation code incorrect',
            extensions: [
                {
                    field: 'code',
                    message: 'Confirmation code incorrect.'
                }
            ],
            data: null
        }

        if (user.emailConfirmation.confirmationCode !== confirmationCode) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'confirmation code incorrect',
            extensions: [
                {
                    field: 'code',
                    message: 'Confirmation code incorrect.'
                }
            ],
            data: null
        }

        if (user.emailConfirmation.confirmationStatus === ConfirmationStatus.Confirmed) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'confirmation code invalid',
            extensions: [
                {
                    field: 'code',
                    message: 'The confirmation code has already been used. The account has already been verified.'
                }
            ],
            data: null
        }

        if (user.emailConfirmation.expirationDate && user.emailConfirmation.expirationDate < new Date()) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'confirmation code invalid',
            extensions: [
                {
                    field: 'code',
                    message: 'The code has expired.'
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

    async checkUserCredentials(authParamsDto: LoginInputModel): Promise<ResultType<string | null>> {
        const {
            loginOrEmail,
            password
        } = authParamsDto;

        const user: WithId<UserDbType> | null = await usersRepository
            .findByLoginOrEmail(loginOrEmail);

        if (!user) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'loginOrEmail incorrect',
            extensions: [{
                field: 'loginOrEmail',
                message: 'There is no user with such data.',
            }],
            data: null
        };

        const isPasswordCorrect: boolean = await bcryptService
            .checkPassword(password, user.passwordHash);

        if (!isPasswordCorrect) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'password incorrect',
            extensions: [{
                field: 'password',
                message: 'Incorrect password.',
            }],
            data: null
        };

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: String(user._id)
        };
    }
};

export {authService};