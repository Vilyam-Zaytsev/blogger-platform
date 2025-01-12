import dotenv from 'dotenv';

dotenv.config();

const SETTINGS = {
    PORT: process.env.PORT || 3000,
    PATH: {
        AUTH: {
            LOGIN: '/auth/login',
            ME: '/auth/me',
        },
        USERS: '/users',
        BLOGS: '/blogs',
        POSTS: '/posts',
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
        NOT_FOUND_404: 404
    },
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    DB_NAME: process.env.DB_NAME || 'blogger-platform-dev-local',
    JWT_SECRET: process.env.JWT_SECRET || 'my_secret'
};

export {SETTINGS};