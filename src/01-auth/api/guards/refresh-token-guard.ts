import {NextFunction, Request, Response} from "express";
import {SETTINGS} from "../../../common/settings";
import {ResultType} from "../../../common/types/result-types/result-type";
import {authService} from "../../domain/auth-service";
import {ResultStatus} from "../../../common/types/result-types/result-status";
import {PayloadRefreshTokenType} from "../../types/payload.refresh.token.type";

const refreshTokenGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (!req.cookies.refreshToken) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    const resultCheckRefreshToken: ResultType<PayloadRefreshTokenType | null> = await authService
        .checkRefreshToken(req.cookies.refreshToken);

    if (resultCheckRefreshToken.status !== ResultStatus.Success) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    req.user = {id: resultCheckRefreshToken.data!};

    return next();
};

export {refreshTokenGuard};