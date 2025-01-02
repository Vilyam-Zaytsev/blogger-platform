import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import {Response} from "supertest";

const postsTestManager = {
    async createPost(
        numberOfPosts: number,
        dataPost: any,
        adminData: string,
        statusCode: number = SETTINGS.HTTP_STATUSES.CREATED_201,
    ) {
        const responses: Response[] = [];

        for (let i = 0; i < numberOfPosts; i++) {
            const res: Response = await req
                .post(SETTINGS.PATH.POSTS)
                .send(this.formingPostData({...dataPost}, (i + 1)))
                .set('Authorization', adminData)
                .expect(statusCode);

            responses.push(res);
        }


        return responses;
    },

    formingPostData(dataPost: any, postNumber: number) {
        return {
            title:
                dataPost.title
                    ? typeof dataPost.title === 'string'
                        ? dataPost.title.trim() !== ''
                            ? `${dataPost.title}_${postNumber}`
                            : ''
                        : dataPost.title
                    : null,
            shortDescription:
                dataPost.shortDescription
                    ? typeof dataPost.shortDescription === 'string'
                        ? dataPost.shortDescription.trim() !== ''
                            ? `${dataPost.shortDescription}_${postNumber}`
                            : ''
                        : dataPost.shortDescription
                    : null,
            content:
                dataPost.content
                    ? typeof dataPost.content === 'string'
                        ? dataPost.content.trim() !== ''
                            ? `${dataPost.content}_${postNumber}`
                            : ''
                        : dataPost.content
                    : null,
            blogId:
                dataPost.blogId
                    ? typeof dataPost.blogId === 'string'
                        ? dataPost.blogId.trim() !== ''
                            ? `${dataPost.blogId}_${postNumber}`
                            : ''
                        : dataPost.blogId
                    : null,
        };
    },
};

export {postsTestManager};