import jwt from 'jsonwebtoken';
import {SETTINGS} from "../settings";
import {AccessTokenType} from "../../01-auth/types/access-token-type";

const jwtService = {
    async createToken(userId: string): Promise<AccessTokenType> {
        const accessToken: string = jwt.sign(
            {userId},
            SETTINGS.JWT_SECRET,
            {expiresIn: '48h'}
        );

        return {accessToken};
    },
    async verifyToken(token: string): Promise<{userId: string} | null> {
        try {
            return jwt.verify(token, SETTINGS.JWT_SECRET) as {userId: string};
        } catch (error) {
            console.error(error);

            return null;
        }
    }
};

export {jwtService};