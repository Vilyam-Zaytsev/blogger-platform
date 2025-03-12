import {ObjectId} from "mongodb";

type PayloadRefreshTokenType = {
    userId: string,
    deviceId: ObjectId,
    iat: number,
    exp: number
}

export {PayloadRefreshTokenType};