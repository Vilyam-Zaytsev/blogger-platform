import {ObjectId} from "mongodb";

type TokenSessionDataType = {
    userId: string,
    deviceId: ObjectId,
};

export {TokenSessionDataType};