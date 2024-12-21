import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";

const postsTestManager = {
    async createPost(
        dataPost: any,
        adminData: string,
        statusCode: number = SETTINGS.HTTP_STATUSES.CREATED_201,
    ) {
        return await req
            .post(SETTINGS.PATH.POSTS)
            .send(dataPost)
            .set('Authorization', adminData)
            .expect(statusCode);
    },

};

export {postsTestManager};