import {ObjectId} from "mongodb";

class Session {
    userId: string;
    deviceId: ObjectId;
    deviceName: string;
    ip: string;
    iat: Date;
    exp: Date;

    constructor(
        userId: string,
        deviceId: ObjectId,
        deviceName: string,
        ip: string,
        iat: Date,
        exp: Date
    ) {
        this.userId = userId;
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.ip = ip;
        this.iat = iat;
        this.exp = exp;
    };
}

export {Session};