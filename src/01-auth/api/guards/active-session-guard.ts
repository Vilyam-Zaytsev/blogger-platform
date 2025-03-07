import {NextFunction, Request, Response} from "express";
import {ResultType} from "../../../common/types/result-types/result-type";
import {AuthService} from "../../domain/auth-service";
import {ResultStatus} from "../../../common/types/result-types/result-status";
import {SETTINGS} from "../../../common/settings";
import {PayloadRefreshTokenType} from "../../types/payload.refresh.token.type";

const authService: AuthService = new AuthService();

const activeSessionGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (!req.cookies.refreshToken) return next();

    const token: string = req.cookies.refreshToken;

    const resultCheckRefreshToken: ResultType<PayloadRefreshTokenType | null> = await authService
        .checkRefreshToken(token);

    if (resultCheckRefreshToken.status !== ResultStatus.Success) return next();

    res
        .sendStatus(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

}

export {activeSessionGuard};