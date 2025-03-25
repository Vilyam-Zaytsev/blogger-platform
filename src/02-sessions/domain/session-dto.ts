import {ObjectId} from "mongodb";

class SessionDto {

    constructor(
        public userId: string,
        public deviceId: ObjectId,
        public deviceName: string,
        public ip: string,
        public iat: Date,
        public exp: Date
    ) {};
}

export {SessionDto};