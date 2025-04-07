enum TypesTokens {
    Access = 'Access',
    Refresh = 'Refresh'
}

type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export {
    AuthTokens,
    TypesTokens
};