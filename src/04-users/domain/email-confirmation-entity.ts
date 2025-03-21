import {ConfirmationStatus} from "../../archive/models/user-model";

class EmailConfirmation {

    constructor(
        public confirmationCode: string | null,
        public expirationDate: Date | null,
        public confirmationStatus: ConfirmationStatus
    ) {}
}

export {EmailConfirmation};