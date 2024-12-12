import  {app} from '../../src/app';
import {agent} from "supertest";

const req = agent(app);

const console_log = (responseBody: any, statusCode: any) => {
    console.log(
        'Test 1: get(/blogs)\n',
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