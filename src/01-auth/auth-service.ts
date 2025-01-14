import {bcryptService} from "../common/services/bcrypt-service";
import {LoginInputType} from "./types/login-input-type";
import {UserDbType} from "../02-users/types/user-db-type";
import {usersRepository} from "../02-users/repositoryes/users-repository";
import {ResultStatusType} from "../common/types/result-types/result-status-type";
import {ResultType} from "../common/types/result-types/result-type";
import {jwtService} from "../common/services/jwt-service";
import {WithId} from "mongodb";
import {AccessTokenType} from "./types/access-token-type";

const authService = {
    async login(authParamsDto: LoginInputType): Promise<ResultType<AccessTokenType | null>> {

        const result: ResultType<WithId<UserDbType> | null> = await this.checkUserCredentials(authParamsDto);

        if (result.status !== ResultStatusType.Success) return {
            status: ResultStatusType.Unauthorized,
            errorMessage: 'auth data incorrect',
            extensions: [{
                field: 'loginOrEmailOrPassword',
                message: 'Login, email or password incorrect.',
            }],
            data: null
        };

        const accessToken: AccessTokenType = await jwtService
            .createToken(String(result.data!._id));

        return {
            status: ResultStatusType.Success,
            extensions: [],
            data: accessToken,
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
                status: ResultStatusType.NotFound,
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
                status: ResultStatusType.BadRequest,
                errorMessage: 'password incorrect',
                extensions: [{
                    field: 'password',
                    message: 'Invalid password.',
                }],
                data: null
            };
        }

        return {
            status: ResultStatusType.Success,
            extensions: [],
            data: isUser
        };
    }
};

export {authService};