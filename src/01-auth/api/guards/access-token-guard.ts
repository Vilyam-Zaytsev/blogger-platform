import {Request, Response, NextFunction} from "express";
import {SETTINGS} from "../../../common/settings";
import {ResultType} from "../../../common/types/result-types/result-type";
import {AuthService} from "../../application/auth-service";
import {ResultStatus} from "../../../common/types/result-types/result-status";
import {container} from "../../../composition-root";

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

    const resultCheckAccessToken: ResultType<string | null> = await authService
        .checkAccessToken(token);

    if (resultCheckAccessToken.status !== ResultStatus.Success) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    req.user = {id: resultCheckAccessToken.data!};

    return next();
};

export {accessTokenGuard};