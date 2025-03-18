import {ConfirmationStatus} from "../../db/mongo-db/models/email-confirmation-model";
import {ObjectId} from "mongodb";

class EmailConfirmation {

    constructor(
        public userId: ObjectId,
        public confirmationCode: string,
        public expirationDate: Date,
        public confirmationStatus: ConfirmationStatus
    ) {}
}

export {EmailConfirmation};