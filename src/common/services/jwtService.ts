import jwt from 'jsonwebtoken';
import {SETTINGS} from "../settings";

const jwtService = {
    async createToken(id: string) {
        return jwt.sign(
            {id},
            SETTINGS.JWT_SECRET,
            {expiresIn: '48h'}
        );
    }
};

export {jwtService};