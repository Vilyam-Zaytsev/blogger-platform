import {bcryptService} from "../common/services/bcryptService";
import {LoginInputType} from "../common/types/input-output-types/login-types";
import {UserDbType} from "../users/types/user-db-type";
import {usersRepository} from "../users/repositoryes/users-repository";
import {ResultStatusType} from "../common/types/result-types/result-status-type";
import {ResultType} from "../common/types/result-types/result-type";

const authService = {
    async login(authParamsDto: LoginInputType): Promise<ResultType> {
        const result: ResultType = await this.checkUserCredentials(authParamsDto);

        if (result.status !== ResultStatusType.Success) return {
            status: ResultStatusType.Unauthorized,
            errorMessage: 'auth data incorrect',
            extensions: [{
                field: 'Login, email, password',
                message: 'Login, email or password incorrect.',
            }],
            data: null
        } as ResultType;

        
    },
    async checkUserCredentials(authParamsDto: LoginInputType): Promise<ResultType> {
        const {
            loginOrEmail,
            password
        } = authParamsDto;

        const isUser: UserDbType | null = await usersRepository
            .findByLoginOrEmail(loginOrEmail);

        if (!isUser) {
            return {
                status: ResultStatusType.NotFound,
                errorMessage: 'loginOrEmail incorrect',
                extensions: [{
                    field: 'loginOrEmail',
                    message: 'There is no user with such data.',
                }],
                data: null
            } as ResultType;
        }

        const isPasswordCorrect = await bcryptService
            .checkPassword(password, isUser.passwordHash);

        if (!isPasswordCorrect) {
           return  {
                status: ResultStatusType.BadRequest,
                    errorMessage: 'password incorrect',
                extensions: [{
                field: 'password',
                message: 'Invalid password.',
            }],
                data: null
            } as ResultType;
        }

        return {
            status: ResultStatusType.Success,
            data: isUser
        } as ResultType;
    }
};

export {authService};