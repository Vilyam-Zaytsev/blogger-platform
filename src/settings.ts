import dotenv from 'dotenv';

dotenv.config();

const SETTINGS = {
    PORT: process.env.PORT || 3000,
    PATH: {
        BLOGS: '/blogs',
        POSTS: '/posts',
        TESTS: '/testing/all-data',
    },
};

export {SETTINGS};