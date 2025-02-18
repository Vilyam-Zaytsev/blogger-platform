import {app} from '../../src/app';
import {agent} from "supertest";

const req = agent(app);

const console_log_e2e = (responseBody: any, statusCode: number, descriptions: string) => {
    console.log(
        `\x1b[4;36m***************${descriptions}***************\x1b[0m\n`,
        JSON.stringify({
            ResponseBody: responseBody,
            StatusCode: statusCode,
        }, (key, value) => (typeof value === "object" && value !== null ? value : value), 4),
    )
};

const console_log_unit = (result: any, descriptions: string) => {
    console.log(
        `\x1b[4;36m***************${descriptions}***************\x1b[0m\n`,
        JSON.stringify({
            TestResult: result,
        }, (key, value) => (typeof value === "object" && value !== null ? value : value), 4),
    )
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

const delay = (ms: number): Promise<void> => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res();
        }, ms);
    });
}

export {
    req,
    delay,
    console_log_e2e,
    console_log_unit,
    generateRandomString,
    encodingAdminDataInBase64,
};