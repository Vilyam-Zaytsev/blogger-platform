import dotenv from 'dotenv';

dotenv.config();

const SETTINGS = {
    PORT: process.env.PORT || 3000,
    PATH: {
        AUTH: {
            BASE: '/auth',
            LOGIN: '/login',
            LOGOUT: '/logout',
            REFRESH_TOKEN: '/refresh-token',
            REGISTRATION: '/registration',
            REGISTRATION_CONFIRMATION: '/registration-confirmation',
            REGISTRATION_EMAIL_RESENDING: '/registration-email-resending',
            PASSWORD_RECOVERY: '/password-recovery',
            NEW_PASSWORD: '/new-password',
            ME: '/me',
        },
        USERS: '/users',
        BLOGS: '/blogs',
        POSTS: '/posts',
        COMMENTS: '/comments',
        LIKE_STATUS: '/like-status',
        SECURITY_DEVICES: {
            BASE: '/security',
            DEVICES: '/devices',
        },
        TESTS: '/testing/all-data',
    },
    ADMIN_DATA: {
        LOGIN: 'admin',
        PASSWORD: 'qwerty'
    },
    HTTP_STATUSES: {
        OK_200: 200,
        CREATED_201: 201,
        NO_CONTENT_204: 204,
        BAD_REQUEST_400: 400,
        UNAUTHORIZED_401: 401,
        FORBIDDEN_403: 403,
        NOT_FOUND_404: 404,
        TOO_MANY_REQUESTS_429: 429,
        INTERNAL_SERVER_ERROR_500: 500
    },
    // MONGO_URL: process.env.MONGO_URL,
    MONGO_URL: process.env.MONGO_URL_LOCAL,
    MONGO_QUERY: 'retryWrites=true&w=majority&appName=Cluster0',
    DB_NAME: process.env.DB_NAME_LOCAL,
    // DB_NAME: process.env.DB_NAME,
    JWT_SECRET_AT: process.env.JWT_SECRET_AT,
    JWT_SECRET_RT: process.env.JWT_SECRET_RT,
    JWT_EXPIRATION_AT: process.env.JWT_EXPIRATION_AT,
    JWT_EXPIRATION_RT: process.env.JWT_EXPIRATION_RT,
};

export {SETTINGS};