import dotenv from 'dotenv';

dotenv.config();

const SETTINGS = {
    PORT: process.env.PORT || 3000,
    PATH: {
        BLOGS: '/blogs',
        POSTS: '/posts',
        TESTS: '/testing/all-data',
    },
    ADMIN_DATA: {
        LOGIN: 'admin',
        PASSWORD: 'qwerty'
    }
};

export {SETTINGS};