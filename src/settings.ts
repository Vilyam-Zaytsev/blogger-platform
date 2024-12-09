import dotenv from 'dotenv';
dotenv.config();

const SETTINGS = {
    PORT: process.env.PORT || 5000,
};

export {SETTINGS};