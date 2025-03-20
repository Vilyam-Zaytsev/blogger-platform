import {ObjectId} from "mongodb";

class PasswordRecovery {

    constructor(
        public recoveryCode: string,
        public expirationDate: Date
    ) {}
}

export {PasswordRecovery};