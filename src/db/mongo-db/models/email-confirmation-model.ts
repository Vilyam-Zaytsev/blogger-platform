import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {EmailConfirmation} from "../../../04-users/domain/email-confirmation-entity";

enum ConfirmationStatus {
    Confirmed = 'Confirmed',
    NotConfirmed = 'Not confirmed'
}

type EmailConfirmationModel = Model<EmailConfirmation>;
type EmailConfirmationDocument = HydratedDocument<EmailConfirmation>;


const emailConfirmationSchema = new Schema<EmailConfirmation>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    confirmationCode: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    confirmationStatus: {
        type: String,
        enum: Object.values(ConfirmationStatus),
        required: true
    }
});

const EmailConfirmationModel: EmailConfirmationModel = mongoose
    .model<EmailConfirmation, EmailConfirmationModel>(
        'EmailConfirmation',
        emailConfirmationSchema
    );

export {
    ConfirmationStatus,
    EmailConfirmationModel,
    EmailConfirmationDocument
}