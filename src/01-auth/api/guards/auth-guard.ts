import {NextFunction, Request, Response} from "express";
import {container} from "../../../composition-root";
import {JwtService} from "../../adapters/jwt-service";
import {PayloadAccessTokenType} from "../../types/payload-access-token-type";

const authGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const jwtService: JwtService = container.get(JwtService);

    if (req.headers.authorization) {

        const token: string = req.headers.authorization.split(' ')[1];

        const payload: PayloadAccessTokenType = await jwtService
            .decodeToken<PayloadAccessTokenType>(token);

            req.user = payload ? {id: payload.userId} : undefined;
    }

    return next();
};

export {authGuard};