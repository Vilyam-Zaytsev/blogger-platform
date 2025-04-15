import jwt from 'jsonwebtoken';
import {SETTINGS} from "../../common/settings";
import {PayloadRefreshTokenType} from "../types/payload-refresh-token-type";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {PayloadAccessTokenType} from "../types/payload-access-token-type";

@injectable()
class JwtService {

    async createAccessToken(userId: string,): Promise<string> {

        return jwt.sign(
            {userId},
            SETTINGS.JWT_SECRET_AT!,
            {expiresIn: SETTINGS.JWT_EXPIRATION_AT!}
        );
    }

    async createRefreshToken(
        userId: string,
        deviceId: ObjectId
    ): Promise<string> {

        return jwt.sign(
            {
                userId,
                deviceId
            },
            SETTINGS.JWT_SECRET_RT!,
            {expiresIn: SETTINGS.JWT_EXPIRATION_RT!}
        );
    }

    async decodeToken<T>(token: string): Promise<T> {

        try {

            return jwt.decode(token) as T;
        } catch (error: unknown) {

            console.error("Can't decode token.\n", error);

            throw new Error("Failed to decode token");
        }
    }

    async verifyAccessToken<T>(token: string): Promise<T> {

        try {

            return jwt.verify(token, SETTINGS.JWT_SECRET_AT!) as T;
        } catch (error) {

            console.error('Access token invalid.\n', error);

            throw new Error('Access token invalid.');
        }
    }

    async verifyRefreshToken<T>(token: string): Promise<T> {

        try {

            return jwt.verify(token, SETTINGS.JWT_SECRET_RT!) as T;
        } catch (error) {

            console.error('Refresh token invalid.\n', error);

            throw new Error('Refresh token invalid.');
        }
    }
}

export {JwtService};