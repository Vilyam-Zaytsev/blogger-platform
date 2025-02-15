import jwt from 'jsonwebtoken';
import {SETTINGS} from "../settings";
import {LoginSuccessViewModel} from "../../01-auth/types/login-success-view-model";

const jwtService = {

    async createAccessToken(userId: string,): Promise<string> {

        return jwt.sign(
            {userId},
            SETTINGS.JWT_SECRET_AT,
            {expiresIn: SETTINGS.JWT_EXPIRATION_RT}
        );
    },

    async createRefreshToken(userId: string,): Promise<string> {

        return jwt.sign(
            {userId},
            SETTINGS.JWT_SECRET_RT,
            {expiresIn: SETTINGS.JWT_EXPIRATION_RT}
        );
    },

    async verifyToken(token: string): Promise<{ userId: string } | null> {

        try {

            return jwt.verify(token, SETTINGS.JWT_SECRET_AT) as { userId: string };
        } catch (error) {
            console.error(error);

            return null;
        }
    }
};

export {jwtService};