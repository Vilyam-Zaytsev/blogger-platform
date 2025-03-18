import {ObjectId} from "mongodb";

class PasswordRecovery {

    constructor(
        public userId: ObjectId,
        public recoveryCode: string,
        public expirationDate: Date
    ) {}
}

export {PasswordRecovery};