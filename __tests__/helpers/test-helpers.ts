import  {app} from '../../src/app';
import {agent} from "supertest";
import {db} from "../../src/db/db";

const req = agent(app);

const console_log = (responseBody: any, statusCode: number, descriptions: string) => {
    console.log(
        descriptions,
        JSON.stringify({
            ResponseBody: responseBody,
            StatusCode: statusCode,
        }, null, 2),
    );
};

const generateRandomString = (length: number) => {
    const chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
};

const encodingAdminDataInBase64 = (login: string, password: string) => {
    const adminData = `${login}:${password}`;
    const adminDataBase64 = Buffer.from(adminData).toString('base64');

    return `Basic ${adminDataBase64}`;
};

const clearDb = (clearBlogs = true, clearPosts = true ) => {
   if (clearBlogs) {
       db.blogs = [];
   }
   if (clearPosts) {
       db.posts = [];
   }

   return;
};

export {
    req,
    console_log,
    generateRandomString,
    encodingAdminDataInBase64,
    clearDb
};