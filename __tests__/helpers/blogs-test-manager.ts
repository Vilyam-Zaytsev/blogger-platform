import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";

const blogsTestManager = {
    async createBlog(
        dataBlog: any,
        adminData: string,
        statusCode: number = SETTINGS.HTTP_STATUSES.CREATED_201,
    ) {
        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(dataBlog)
            .set('Authorization', adminData)
            .expect(statusCode);

        return res;
    },

};

export {blogsTestManager};