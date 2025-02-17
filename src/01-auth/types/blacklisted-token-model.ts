type BlacklistedTokenModel = {
    refreshToken: string;
    userId: string;
    revokedAt: Date;
    expiresAt: Date;
};

export {BlacklistedTokenModel};