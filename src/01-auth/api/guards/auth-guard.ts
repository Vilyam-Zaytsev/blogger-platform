import {NextFunction, Request, Response} from "express";
import {container} from "../../../composition-root";
import {JwtService} from "../../adapters/jwt-service";
import {PayloadAccessTokenType} from "../../types/payload-access-token-type";

const authGuard = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    try {

        const jwtService: JwtService = container.get(JwtService);

        if (req.headers.authorization) {

            const [
                format,
                token
            ] = req.headers.authorization.split(' ');

            if (format === 'Bearer') {

                const payload: PayloadAccessTokenType = await jwtService
                    .verifyToken<PayloadAccessTokenType>(token);

                req.user = {id: payload.userId};
            }

        }

        return next();
    } catch (error) {

        console.error(error);

        return next();
    }


};

export {authGuard};