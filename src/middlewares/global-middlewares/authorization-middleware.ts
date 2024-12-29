import {Request, Response, NextFunction} from "express";
import {SETTINGS} from "../../settings";

const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('authMiddleware')
    const auth = req.headers['authorization'] as string;
    if (!auth) {
        res
            .status(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401)
            .end();

        return;
    }

    const adminData = `${SETTINGS.ADMIN_DATA.LOGIN}:${SETTINGS.ADMIN_DATA.PASSWORD}`;
    const adminDataBase64 = Buffer.from(adminData).toString('base64');

    if (auth.slice(6) !== adminDataBase64) {
        res
            .status(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401)
            .end();

        return;
    }

    next();
}

export {authMiddleware};