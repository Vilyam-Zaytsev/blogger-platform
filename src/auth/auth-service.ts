import {bcryptService} from "../common/services/bcryptService";
import {LoginInputType} from "../common/types/input-output-types/login-types";
import {UserDbType} from "../users/types/user-db-type";
import {usersRepository} from "../users/repositoryes/users-repository";

const authService = {
    async login(authParamsDto: LoginInputType): Promise<boolean> {
        return this.checkUserCredentials(authParamsDto);
    },
    async checkUserCredentials(authParamsDto: LoginInputType): Promise<boolean> {
        const {
            loginOrEmail,
            password
        } = authParamsDto;

        const isUser: UserDbType | null = await usersRepository
            .findByLoginOrEmail(loginOrEmail);

        if (!isUser) return false;

        const isPasswordCorrect = await bcryptService
            .checkPassword(password, isUser.passwordHash);

        if (!isPasswordCorrect) return false;

        return true;
    }
};

export {authService};