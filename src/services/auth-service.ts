import {LoginInputType} from "../types/input-output-types/login-types";
import {usersRepository} from "../repositoryes/users-repository";
import {UserDbType} from "../types/db-types/user-db-type";
import {bcryptService} from "../common/services/bcryptService";

const authService = {
    async login(authParamsDto: LoginInputType): Promise<boolean> {
        return this.checkUserCredentials(authParamsDto);
    },
    async checkUserCredentials(authParamsDto: LoginInputType): boolean {
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