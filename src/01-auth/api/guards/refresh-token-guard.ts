import {NextFunction, Request, Response} from "express";
import {SETTINGS} from "../../../common/settings";
import {ResultType} from "../../../common/types/result-types/result-type";
import {AuthService} from "../../domain/auth-service";
import {ResultStatus} from "../../../common/types/result-types/result-status";
import {PayloadRefreshTokenType} from "../../types/payload.refresh.token.type";
import {ObjectId} from "mongodb";
import {container} from "../../../composition-root";

const refreshTokenGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const authService: AuthService = container.get(AuthService);

    if (!req.cookies.refreshToken) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    const token: string = req.cookies.refreshToken;

    const {
        data: payload,
        status: refreshTokenVerificationStatus
    }: ResultType<PayloadRefreshTokenType | null> = await authService
        .checkRefreshToken(token);

    if (refreshTokenVerificationStatus !== ResultStatus.Success) {

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    req.session = {
        userId: payload!.userId,
        deviceId: new ObjectId(payload!.deviceId)
    };

    return next();
};

export {refreshTokenGuard};