import {ObjectId} from "mongodb";

type TokenSessionDataType = {
    iat: Date,
    userId: string,
    deviceId: ObjectId
};

export {TokenSessionDataType};