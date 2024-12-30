import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import {Response} from "supertest";

const blogsTestManager = {
    async createBlog(
        numberOfBlogs: number,
        dataBlog: any,
        adminData: string,
        statusCode: number = SETTINGS.HTTP_STATUSES.CREATED_201,
    ) {
        const responses: Response[] = [];

        for (let i = 0; i < numberOfBlogs; i++) {
            const res: Response = await req
                .post(SETTINGS.PATH.BLOGS)
                .send({
                    name: `${dataBlog.name}_${i + 1}`,
                    description: `${dataBlog.description}_${i + 1}`,
                    websiteUrl: dataBlog.websiteUrl
                })
                .set('Authorization', adminData)
                .expect(statusCode);

            responses.push(res);
        }



        return responses;
    },

};

export {blogsTestManager};