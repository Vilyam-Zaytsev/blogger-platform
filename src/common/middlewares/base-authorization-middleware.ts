import {Request, Response, NextFunction} from "express";
import {SETTINGS} from "../settings";

const baseAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const auth = req.headers['authorization'] as string;
    if (!auth) {
        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    const adminData = `${SETTINGS.ADMIN_DATA.LOGIN}:${SETTINGS.ADMIN_DATA.PASSWORD}`;
    const adminDataBase64 = Buffer.from(adminData).toString('base64');

    if (auth.slice(6) !== adminDataBase64) {
        res
            .sendStatus(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        return;
    }

    next();
}

export {baseAuthMiddleware};