import  {app} from '../../src/app';
import {agent} from "supertest";

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
}

export {
    req,
    console_log,
    generateRandomString
};