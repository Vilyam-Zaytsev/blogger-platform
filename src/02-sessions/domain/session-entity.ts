import {ObjectId} from "mongodb";
import {SessionDto} from "./session-dto";

class Session {
    userId: string;
    deviceId: ObjectId;
    deviceName: string;
    ip: string;
    iat: Date;
    exp: Date;

    private constructor(
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

    static createSession(sessionDto: SessionDto) {

        return Object.assign(new this(), sessionDto);
    }
}

export {Session};