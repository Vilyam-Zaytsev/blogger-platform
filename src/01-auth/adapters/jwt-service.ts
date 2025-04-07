import jwt from 'jsonwebtoken';
import {SETTINGS} from "../../common/settings";
import {PayloadRefreshTokenType} from "../types/payload-refresh-token-type";
import {ObjectId} from "mongodb";
import {injectable} from "inversify";
import {PayloadAccessTokenType} from "../types/payload-access-token-type";
import {TypesTokens} from "../types/auth-tokens-type";
import {isAccessToken, isRefreshToken} from "../../common/helpers/type-guards";

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

    decodeToken(token: string, type: TypesTokens.Access): Promise<PayloadAccessTokenType | null>;
    decodeToken(token: string, type: TypesTokens.Refresh): Promise<PayloadRefreshTokenType | null>;
    async decodeToken(
        token: string,
        type: TypesTokens
    ): Promise<PayloadAccessTokenType | PayloadRefreshTokenType | null> {

        try {

            // return jwt.decode(token) as PayloadAccessTokenType | PayloadRefreshTokenType | null;
            const payload = jwt.decode(token);

            if (typeof payload !== 'object' || payload === null) return null;

            if (type === TypesTokens.Access && isAccessToken(payload)) return payload;

            if (type === TypesTokens.Refresh && isRefreshToken(payload)) return payload;

            return null;
        } catch (error: unknown) {

            console.error("Can't decode token", error);

            return null;
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