import {Response} from "express";
import {RequestWithBody} from "../types/input-output-types/request-types";
import {LoginInputModel} from "../types/input-output-types/login-types";

const authController = {
    login: async (
        req: RequestWithBody<LoginInputModel>,
        res: Response
    ) => {
        
    }
};

export {authController};