import {NextFunction, Request, Response} from "express";
import {ResultType} from "../../../common/types/result-types/result-type";
import {authService} from "../../domain/auth-service";
import {ResultStatus} from "../../../common/types/result-types/result-status";
import {sessionsService} from "../../../02-sessions/domain/sessions-service";
import {jwtService} from "../../adapters/jwt-service";
import {SETTINGS} from "../../../common/settings";

const activeSessionGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (!req.cookies.refreshToken) next();

    const token: string = req.cookies.refreshToken;

    const resultCheckRefreshToken: ResultType<string | null> = await authService
        .checkRefreshToken(token);

    if (resultCheckRefreshToken.status !== ResultStatus.Success) next();

    const payload = await jwtService
        .decodeToken(token);

    const {
        iat,
        deviceId
    } = payload;

    const resultIsSessionActive: ResultType<string | null> = await sessionsService
        .isSessionActive(iat, deviceId);

    if (resultIsSessionActive.status !== ResultStatus.Success) next();

    res
        .sendStatus(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
}