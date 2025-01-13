import {Request, Response, NextFunction} from "express";
import {SETTINGS} from "../settings";
import {jwtService} from "../services/jwtService";
import {usersRepository} from "../../users/repositoryes/users-repository";
import {UserDbType} from "../../users/types/user-db-type";
import {IdType} from "../types/input-output-types/id-type";

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

        const isUser: UserDbType | null = await usersRepository
            .findUser(userId);

        if (!isUser) {
            res
                .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            return;
        }

        req
            .user = {id: userId} as IdType;

        return next();
    }

    res
        .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
};

export {bearerAuthorizationMiddleware};