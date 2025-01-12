import {bcryptService} from "../common/services/bcryptService";
import {LoginInputType} from "../common/types/input-output-types/login-types";
import {UserDbType} from "../users/types/user-db-type";
import {usersRepository} from "../users/repositoryes/users-repository";
import {ResultStatusType} from "../common/types/result-types/result-status-type";
import {ResultType} from "../common/types/result-types/result-type";
import {jwtService} from "../common/services/jwtService";
import {WithId} from "mongodb";
import {OutputAccessTokenType} from "../common/types/input-output-types/output-access-token-type";
import {qUserService} from "../users/services/qUsers-servise";
import {PresentationView} from "../users/types/presentation-view";
import {UserMeViewModel} from "../users/types/input-output-types";

const authService = {
    async login(authParamsDto: LoginInputType): Promise<ResultType<OutputAccessTokenType | null>> {
        const result: ResultType<WithId<UserDbType> | null> = await this.checkUserCredentials(authParamsDto);

        if (result.status !== ResultStatusType.Success) return {
            status: ResultStatusType.Unauthorized,
            errorMessage: 'auth data incorrect',
            extensions: [{
                field: 'loginOrEmailOrPassword',
                message: 'Login, email or password incorrect.',
            }],
            data: null
        } as ResultType;

        const accessToken = await jwtService
            .createToken(result.data!._id.toString());

        return {
            status: ResultStatusType.Success,
            data: {accessToken},
        }
    },
    async me(userId: string): Promise<ResultType<UserMeViewModel | null>> {
        if (!userId) {
            return {
                status: ResultStatusType.Unauthorized,
                data: null
            };
        }

        const me: UserMeViewModel = await qUserService
            .findUser(userId, PresentationView.MeViewModal) as UserMeViewModel;

        return {
            status: ResultStatusType.Success,
            data: me
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
        } as ResultType<WithId<UserDbType>>;
    }
};

export {authService};