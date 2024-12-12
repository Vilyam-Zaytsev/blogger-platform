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
}

export {
    req,
    console_log
};