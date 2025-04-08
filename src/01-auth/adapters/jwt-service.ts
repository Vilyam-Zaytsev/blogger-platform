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
            //TODO: throw error!!!
            console.error("Can't decode token", error);

            throw new Error("Failed to decode token");
        }
    }

    async verifyAccessToken(token: string): Promise<PayloadAccessTokenType | null> {

        try {

            return jwt.verify(token, SETTINGS.JWT_SECRET_AT!) as PayloadAccessTokenType;
        } catch (error) {
            console.error(error);

            return null;
        }
    }

    async verifyRefreshToken(token: string): Promise<PayloadRefreshTokenType | null> {

        try {

            return jwt.verify(token, SETTINGS.JWT_SECRET_RT!) as PayloadRefreshTokenType;
        } catch (error) {
            console.error((error as Error).message);

            return null;
        }
    }
}

export {JwtService};