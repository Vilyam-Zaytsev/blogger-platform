import {ObjectId} from "mongodb";

class PasswordRecoveryDto {

    constructor(
        public recoveryCode: string,
        public expirationDate: Date
    ) {}
}

export {PasswordRecoveryDto};