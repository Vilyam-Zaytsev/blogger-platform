enum ConfirmationStatus {
    Confirmed = 'Confirmed',
    NotConfirmed = 'Not confirmed'
}

type UserDbType = {
    login: string,
    email: string,
    passwordHash: string,
    createdAt: string,
    emailConfirmation: {
        confirmationCode: string | null;
        expirationDate: Date | null;
        confirmationStatus: ConfirmationStatus;
    }
};

export {
    ConfirmationStatus,
    UserDbType
};