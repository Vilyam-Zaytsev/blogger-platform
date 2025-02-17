import {Request, Response, NextFunction} from "express";
import {SETTINGS} from "../../../common/settings";
import {jwtService} from "../../../common/adapters/jwt-service";
import {usersRepository} from "../../../02-users/repositoryes/users-repository";
import {UserDbType} from "../../../02-users/types/user-db-type";
import {IdType} from "../../../common/types/input-output-types/id-type";
import {ResultType} from "../../../common/types/result-types/result-type";
import {authService} from "../../auth-service";
import {ResultStatus} from "../../../common/types/result-types/result-status";

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

    const resultCheckRefreshToken: ResultType<string | null> = await authService
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