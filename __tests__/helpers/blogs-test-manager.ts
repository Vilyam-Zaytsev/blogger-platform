import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import {BlogInputModel} from "../../src/types/input-output-types/blogs-types";

const blogsTestManager = {
    async createBlog(
        dataBlog: any,
        statusCode: number = SETTINGS.HTTP_STATUSES.CREATED_201
    ) {
        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(dataBlog)
            .set(
                'Authorization',
                this.encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(statusCode);

        return res;
    },
    encodingAdminDataInBase64(login: string, password: string) {
        const adminData = `${login}:${password}`;
        const adminDataBase64 = Buffer.from(adminData).toString('base64');

        return `Basic ${adminDataBase64}`;
    }
};

export {blogsTestManager};