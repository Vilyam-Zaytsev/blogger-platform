import {NextFunction, Request, Response} from "express";
import {SETTINGS} from "../../../common/settings";
import {ResultType} from "../../../common/types/result-types/result-type";
import {AuthService} from "../../domain/auth-service";
import {ResultStatus} from "../../../common/types/result-types/result-status";
import {PayloadRefreshTokenType} from "../../types/payload.refresh.token.type";

const refreshTokenGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const authService: AuthService = new AuthService();

    if (!req.cookies.refreshToken) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    const token: string = req.cookies.refreshToken;

    const resultCheckRefreshToken: ResultType<PayloadRefreshTokenType | null> = await authService
        .checkRefreshToken(token);

    if (resultCheckRefreshToken.status !== ResultStatus.Success) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    //TODO: стоит ли создавать данные сессии в гарде???
    req.session = {
        iat: new Date(resultCheckRefreshToken.data!.iat * 1000),
        userId: resultCheckRefreshToken.data!.userId,
        deviceId: resultCheckRefreshToken.data!.deviceId
    };

    return next();
};

export {refreshTokenGuard};