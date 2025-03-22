import {ConfirmationStatus} from "./user-entity";

class EmailConfirmationDto {

    constructor(
        public confirmationCode: string | null,
        public expirationDate: Date | null,
        public confirmationStatus: ConfirmationStatus
    ) {}
}

export {EmailConfirmationDto};