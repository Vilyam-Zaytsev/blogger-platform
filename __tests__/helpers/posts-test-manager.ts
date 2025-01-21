import {Response} from "supertest";
import {PostInputModel, PostViewModel} from "../../src/04-posts/types/input-output-types";
import {
    blogNames,
    postContents,
    postShortDescriptions,
    postTitles,
    presets
} from "./datasets-for-tests";
import {encodingAdminDataInBase64, req} from "./test-helpers";
import {SETTINGS} from "../../src/common/settings";

const postsTestManager = {
    async createPost(numberOfPosts: number) {
        const responses: Response[] = [];

        for (let i = 0; i < numberOfPosts; i++) {
            const post: PostInputModel = {
                title: postTitles[i],
                shortDescription: postShortDescriptions[i],
                content: postContents[i],
                blogId: presets.blogs[0].id
            }

            const res: Response = await req
                .post(SETTINGS.PATH.POSTS)
                .send(post)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    ))
                .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

            expect(res.body).toEqual<PostViewModel>({
                id: expect.any(String),
                title: postTitles[i],
                shortDescription: postShortDescriptions[i],
                content: postContents[i],
                blogId: presets.blogs[0].id,
                blogName: blogNames[i],
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            presets.posts.push(res.body);

            responses.push(res);
        }


        return responses;
    },


    filterAndSort(
        items: PostViewModel[],
        sortBy: keyof PostViewModel = 'createdAt',
        sortDirection: string = 'desc',
        pageNumber: number = 1,
        pageSize: number = 10,
    ) {
        let startIndex = (pageNumber - 1) * pageSize;
        let finishIndex = startIndex + pageSize;

        return items
            .sort((a: PostViewModel, b: PostViewModel) => {
                return a[sortBy] > b[sortBy]
                    ? sortDirection === 'desc' ? -1 : 1
                    : a[sortBy] < b[sortBy]
                        ? sortDirection === 'desc' ? 1 : -1
                        : sortDirection === 'desc' ? -1 : 1
            })
            .filter((b, i) => {
                return i >= startIndex && i < finishIndex ? b : null;
            })
    }
};

// const postsTestManager = {
//     async createPost(
//         numberOfPosts: number,
//         dataPost: any,
//         adminData: string,
//         statusCode: number = SETTINGS.HTTP_STATUSES.CREATED_201,
//         path: string = SETTINGS.PATH.POSTS
//     ) {
//         const responses: Response[] = [];
//
//         for (let i = 0; i < numberOfPosts; i++) {
//             const res: Response = await req
//                 .post(path)
//                 .send(this.formingPostData({...dataPost}, (i + 1)))
//                 .set('Authorization', adminData)
//                 .expect(statusCode);
//
//             responses.push(res);
//         }
//
//
//         return responses;
//     },
//
//     formingPostData(dataPost: any, postNumber: number) {
//         return {
//             title:
//                 dataPost.title
//                     ? typeof dataPost.title === 'string'
//                         ? dataPost.title.trim() !== ''
//                             ? `${dataPost.title}_${postNumber}`
//                             : ''
//                         : dataPost.title
//                     : null,
//             shortDescription:
//                 dataPost.shortDescription
//                     ? typeof dataPost.shortDescription === 'string'
//                         ? dataPost.shortDescription.trim() !== ''
//                             ? `${dataPost.shortDescription}_${postNumber}`
//                             : ''
//                         : dataPost.shortDescription
//                     : null,
//             content:
//                 dataPost.content
//                     ? typeof dataPost.content === 'string'
//                         ? dataPost.content.trim() !== ''
//                             ? `${dataPost.content}_${postNumber}`
//                             : ''
//                         : dataPost.content
//                     : null,
//             blogId: dataPost.blogId
//         };
//     },
//     filterAndSort(
//         items: PostViewModel[],
//         sortBy: keyof PostViewModel = 'createdAt',
//         sortDirection: string = 'desc',
//         pageNumber: number = 1,
//         pageSize: number = 10,
//     ) {
//         let startIndex = (pageNumber - 1) * pageSize;
//         let finishIndex = startIndex + pageSize;
//
//         return items
//             .sort((a: PostViewModel, b: PostViewModel) => {
//                 return a[sortBy] > b[sortBy]
//                     ? sortDirection === 'desc' ? -1 : 1
//                     : a[sortBy] < b[sortBy]
//                         ? sortDirection === 'desc' ? 1 : -1
//                         : sortDirection === 'desc' ? -1 : 1
//             })
//             .filter((b, i) => {
//                 return i >= startIndex && i < finishIndex ? b : null;
//             })
//     }
// };

export {postsTestManager};