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
            ME: '/me',
        },
        USERS: '/users',
        BLOGS: '/blogs',
        POSTS: '/posts',
        COMMENTS: '/comments',
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
        INTERNAL_SERVER_ERROR_500: 500
    },
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    DB_NAME: process.env.DB_NAME || 'blogger-platform-dev-local',
    JWT_SECRET_AT: process.env.JWT_SECRET_AT || 'my_secret_AT',
    JWT_SECRET_RT: process.env.JWT_SECRET_RT || 'my_secret_RT',
    JWT_EXPIRATION_AT: process.env.JWT_EXPIRATION_AT || 10,
    JWT_EXPIRATION_RT: process.env.JWT_EXPIRATION_RT || 20,
};

export {SETTINGS};