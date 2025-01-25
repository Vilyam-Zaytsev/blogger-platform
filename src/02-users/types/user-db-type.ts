enum ConfirmationStatuses {
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
        confirmationStatus: ConfirmationStatuses;
    }
};

export {
    ConfirmationStatuses,
    UserDbType
};