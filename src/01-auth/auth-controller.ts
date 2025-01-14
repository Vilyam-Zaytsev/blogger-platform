import {Response} from "express";
import {RequestWithBody, RequestWithUserId} from "../common/types/input-output-types/request-types";
import {LoginInputType} from "./types/login-input-type";
import {authService} from "./auth-service";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatusType} from "../common/types/result-types/result-status-type";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {mapResultExtensionsToErrorMessage} from "../common/helpers/map-result-extensions-to-error-message";
import {OutputErrorsType} from "../common/types/input-output-types/output-errors-type";
import {IdType} from "../common/types/input-output-types/id-type";
import {UserMeViewModel} from "../02-users/types/input-output-types";
import {AccessTokenType} from "./types/access-token-type";
import {qUserService} from "../02-users/services/users-query-servise";
import {PresentationView} from "../02-users/types/presentation-view";
import {SETTINGS} from "../common/settings";

const authController = {
    login: async (
        req: RequestWithBody<LoginInputType>,
        res: Response<OutputErrorsType | AccessTokenType>
    ) => {

        const authParams: LoginInputType = {
            loginOrEmail: req.body.loginOrEmail,
            password: req.body.password
        };

        const result: ResultType<AccessTokenType | null> = await authService
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
        req: RequestWithUserId<IdType>,
        res: Response<UserMeViewModel>
    ) => {

        const userId: string = String(req.user?.id);

        if (!userId) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
        }

        const me: UserMeViewModel = await qUserService
            .findUser(userId, PresentationView.MeViewModal) as UserMeViewModel;

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(me);
    },
};

export {authController};