import {LoginInputType} from "../types/input-output-types/login-types";
import {usersController} from "../controllers/usersController";
import {qUserService} from "./qUser-servise";

const authService = {
    async login(authParamsDto: LoginInputType) {

    },
    async checkLogin(login: string): boolean {
        // const user = await qUserService.
    }
}