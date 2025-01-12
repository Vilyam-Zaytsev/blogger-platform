import jwt from 'jsonwebtoken';
import {SETTINGS} from "../settings";

const jwtService = {
    async createToken(id: string) {
        return jwt.sign(
            {id},
            SETTINGS.JWT_SECRET,
            {expiresIn: '48h'}
        );
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