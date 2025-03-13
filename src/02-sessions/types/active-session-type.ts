import {ObjectId} from "mongodb";

type ActiveSessionType = {
    userId: string;
    deviceId: ObjectId;
    deviceName: string;
    ip: string;
    iat: Date;
    exp: Date;
};

export {ActiveSessionType};