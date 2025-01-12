import {Request, Response, NextFunction} from "express";
import {SETTINGS} from "../settings";
import {jwtService} from "../services/jwtService";
import {qUserService} from "../../users/services/qUsers-servise";

const bearerAuthorizationMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.headers.authorization) {
        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    const token: string = req.headers.authorization.split(' ')[1];

    const payload= await jwtService
        .verifyToken(token);

    if (payload) {
        const {userId} = payload;

        const isUser = await qUserService
            .findUser(userId);

        if (!isUser) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
        }

        req
            .user = {id: userId};

        next();
    }

    res
        .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
}