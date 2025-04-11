import {Request, Response, NextFunction} from "express";
import {SETTINGS} from "../../../common/settings";
import {ResultType} from "../../../common/types/result-types/result-type";
import {AuthService} from "../../application/auth-service";
import {ResultStatus} from "../../../common/types/result-types/result-status";
import {container} from "../../../composition-root";
import {isSuccessfulResult} from "../../../common/helpers/type-guards";

const accessTokenGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const authService: AuthService = container.get(AuthService);

    if (!req.headers.authorization) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    const token: string = req.headers.authorization.split(' ')[1];

    const {
        status: accessTokenVerificationStatus,
        data: userId
    }: ResultType<string | null> = await authService
        .checkAccessToken(token);

    if (!isSuccessfulResult(accessTokenVerificationStatus, userId)) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    req.user = {id: userId};

    return next();
};

export {accessTokenGuard};