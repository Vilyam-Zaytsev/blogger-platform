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
import {ResultObject} from "../common/helpers/result-object";

const authService = {

    async login(authParamsDto: LoginInputModel): Promise<ResultType<LoginSuccessViewModel | null>> {

        const resultCheckUserCredentials: ResultType<string | null> = await this.checkUserCredentials(authParamsDto);

        if (resultCheckUserCredentials.status !== ResultStatus.Success) return ResultObject
            .negative(
                ResultStatus.Unauthorized,
                'loginOrEmailOrPassword',
                'Login, email or password incorrect.'
            );

        const accessToken: LoginSuccessViewModel = await jwtService
            .createToken(resultCheckUserCredentials.data!);

        return ResultObject
            .positive(
                ResultStatus.Success,
                accessToken
            );
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

        return ResultObject
            .positive(ResultStatus.Success);
    },

    async registrationConfirmation(confirmationCode: string): Promise<ResultType> {

        const user: WithId<UserDbType> | null = await usersRepository
            .findByConfirmationCode(confirmationCode);


        if (!user) return ResultObject
            .negative(
                ResultStatus.BadRequest,
                'code',
                'Confirmation code incorrect.'
            );

        if (user.emailConfirmation.confirmationCode !== confirmationCode) return ResultObject
            .negative(
                ResultStatus.BadRequest,
                'code',
                'Confirmation code incorrect.'
            );

        if (user.emailConfirmation.confirmationStatus === ConfirmationStatus.Confirmed) return ResultObject
            .negative(
                ResultStatus.BadRequest,
                'code',
                'The confirmation code has already been used. The account has already been verified.'
            );

        if (user.emailConfirmation.expirationDate && user.emailConfirmation.expirationDate < new Date()) return ResultObject
            .negative(
                ResultStatus.BadRequest,
                'code',
                'The code has expired.'
            );

        const resultUpdateConfirmationStatus = await usersRepository
            .updateConfirmationStatus(user._id);

        if (!resultUpdateConfirmationStatus) return ResultObject
            .negative(
                ResultStatus.InternalServerError,
                'confirmationStatus',
                'The confirmation status could not be updated. Server error.'
            );

        return ResultObject
            .positive(ResultStatus.Success);
    },

    async registrationEmailResending(email: string): Promise<ResultType> {

        const user: WithId<UserDbType> | null = await usersRepository
            .findByEmail(email);

        if (!user) return ResultObject
            .negative(
                ResultStatus.BadRequest,
                'email',
                'There is no user with this email address.'
            );

        if (user.emailConfirmation.confirmationStatus === ConfirmationStatus.Confirmed) return ResultObject
            .negative(
                ResultStatus.BadRequest,
                'email',
                'The users have already confirmed their credentials.'
            );

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

        if (!resultUpdateEmailConfirmation) return ResultObject
            .negative(
                ResultStatus.InternalServerError,
                'emailConfirmation',
                'The confirmation code and  could not be updated. Server error.'
            );

        await nodemailerService
            .sendEmail(
                user.email,
                emailTemplates
                    .registrationEmail(confirmationCode)
            )
            .catch(error => console.error('ERROR IN SEND EMAIL:', error));

        return ResultObject
            .positive(ResultStatus.Success);
    },

    async checkUserCredentials(authParamsDto: LoginInputModel): Promise<ResultType<string | null>> {
        const {
            loginOrEmail,
            password
        } = authParamsDto;

        const user: WithId<UserDbType> | null = await usersRepository
            .findByLoginOrEmail(loginOrEmail);

        if (!user) return ResultObject
            .negative(
                ResultStatus.BadRequest,
                'loginOrEmail',
                'There is no user with such data.'
            );

        const isPasswordCorrect: boolean = await bcryptService
            .checkPassword(password, user.passwordHash);

        if (!isPasswordCorrect) return ResultObject
            .negative(
                ResultStatus.BadRequest,
                'password',
                'Incorrect password.'
            );

        return ResultObject
            .positive<string>(
                ResultStatus.Success,
                String(user._id)
            );
    }
};

export {authService};