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
                .send(this.formingBlogData({...dataBlog}, (i + 1)))
                .set('Authorization', adminData)
                .expect(statusCode);

            responses.push(res);
        }


        return responses;
    },

    formingBlogData(dataBlog: any, blogNumber: number) {
        return {
            name:
                dataBlog.name
                    ? typeof dataBlog.name === 'string'
                        ? dataBlog.name.trim() !== ''
                            ? `${dataBlog.name}_${blogNumber}`
                            : ''
                        : dataBlog.name
                    : null,
            description:
                dataBlog.description
                    ? typeof dataBlog.description === 'string'
                        ? dataBlog.description.trim() !== ''
                            ? `${dataBlog.description}_${blogNumber}`
                            : ''
                        : dataBlog.description
                    : null,
            websiteUrl: dataBlog.websiteUrl
                ? typeof dataBlog.description === 'string'
                    ? dataBlog.websiteUrl.trim() !== ''
                        ? dataBlog.websiteUrl
                        : ''
                    : dataBlog.description
                : null
        }
    }

};

export {blogsTestManager};