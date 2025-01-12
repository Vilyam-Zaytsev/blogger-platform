import {Response, Request} from "express";
import {RequestWithBody} from "../common/types/input-output-types/request-types";
import {LoginInputType} from "../common/types/input-output-types/login-types";
import {authService} from "./auth-service";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatusType} from "../common/types/result-types/result-status-type";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {mapResultExtensionsToErrorMessage} from "../common/helpers/map-result-extensions-to-error-message";
import {OutputAccessTokenType} from "../common/types/input-output-types/output-access-token-type";
import {OutputErrorsType} from "../common/types/input-output-types/output-errors-type";

const authController = {
    login: async (
        req: RequestWithBody<LoginInputType>,
        res: Response<OutputErrorsType | OutputAccessTokenType>
    ) => {
        const authParams: LoginInputType = {
            loginOrEmail: req.body.loginOrEmail,
            password: req.body.password
        };

        const result: ResultType<OutputAccessTokenType | null> = await authService
            .login(authParams);

        if (result.status !== ResultStatusType.Success) {
            res
                .status(mapResultStatusToHttpStatus(result.status))
                .json(mapResultExtensionsToErrorMessage(result.extensions!));

            return;
        }

        res
            .status(mapResultStatusToHttpStatus(ResultStatusType.Success))
            .json({...result.data!});
    },
    me: async (
        req: Request,
        res: Response
    ) => {

    }
};

export {authController};