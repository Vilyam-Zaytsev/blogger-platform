import {Response} from "express";
import {RequestWithBody} from "../types/input-output-types/request-types";
import {LoginInputType} from "../types/input-output-types/login-types";

const authController = {
    login: async (
        req: RequestWithBody<LoginInputType>,
        res: Response
    ) => {
        const authParams: LoginInputType = {
            loginOrEmail: req.body.loginOrEmail,
            password: req.body.password
        };


    }
};

export {authController};