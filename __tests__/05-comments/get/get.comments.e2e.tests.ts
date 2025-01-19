import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {
    blogsCollection, commentsCollection, postsCollection,
    setBlogsCollection,
    setCommentsCollection,
    setPostsCollection,
    setUsersCollection, usersCollection
} from "../../../src/db/mongoDb";
import {UserDbType} from "../../../src/02-users/types/user-db-type";
import {BlogDbType} from "../../../src/03-blogs/types/blog-db-type";
import {PostDbType} from "../../../src/04-posts/types/post-db-type";
import {CommentDbType} from "../../../src/05-comments/types/comment-db-type";
import {clearPresets, comments, incorrectAccessToken, presets} from "../../helpers/datasets-for-tests";
import {blogsTestManager} from "../../helpers/blogs-test-manager";
import {postsTestManager} from "../../helpers/posts-test-manager";
import {usersTestManager} from "../../helpers/users-test-manager";
import {authTestManager} from "../../helpers/auth-test-manager";
import {Response} from "supertest";
import {console_log, generateRandomString, req} from "../../helpers/test-helpers";
import {SETTINGS} from "../../../src/common/settings";
import {CommentViewModel} from "../../../src/05-comments/types/input-output-types";
import {OutputErrorsType} from "../../../src/common/types/input-output-types/output-errors-type";
import {PaginationResponse, SortDirection} from "../../../src/common/types/input-output-types/pagination-sort-types";
import {commentsService} from "../../../src/05-comments/comments-service";
import {commentsTestManager} from "../../helpers/comments-test-manager";
import {createPaginationAndSortFilter} from "../../../src/common/helpers/create-pagination-and-sort-filter";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setUsersCollection(db.collection<UserDbType>('users'));
    setBlogsCollection(db.collection<BlogDbType>('blogs'));
    setPostsCollection(db.collection<PostDbType>('posts'));
    setCommentsCollection(db.collection<CommentDbType>('comments'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await commentsCollection.deleteMany({});

    clearPresets();
});

describe('GET /comments', () => {
    it('should return an empty array.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body).toEqual<PaginationResponse<CommentViewModel>>({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        });

        console_log(resGetComments.body, resGetComments.status, 'Test 1: get(/comments)');
    });
    it('should return an array with a single comment.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(1);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body).toEqual<PaginationResponse<CommentViewModel>>({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [
                {
                    id: presets.comments[0].id,
                    content: presets.comments[0].content,
                    commentatorInfo: {
                        userId: presets.users[0].id,
                        userLogin: presets.users[0].login
                    },
                    createdAt: presets.comments[0].createdAt
                }
            ]
        })

        expect(resGetComments.body.items.length).toEqual(1);

        console_log(resGetComments.body, resGetComments.status, 'Test 2: get(/comments)');
    });
    it('should return an array with three comments.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(3);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        for (let i = 0; i < resGetComments.body.items.length; i++) {
            expect(resGetComments.body.items[i]).toEqual(
                commentsTestManager.filterAndSort(
                    presets.comments,
                    createPaginationAndSortFilter({
                        pageNumber: '1',
                        pageSize: '10',
                        sortBy: 'createdAt',
                        sortDirection: SortDirection.Descending
                    })
                )[i]
            );
        }

        expect(resGetComments.body.items.length).toEqual(3);

        console_log(resGetComments.body, resGetComments.status, 'Test 2: get(/comments)');
    });
    // it('should not create a new comment If post with specified postId doesn\'t exists.', async () => {
    //
    //     await blogsTestManager
    //         .createBlog(1);
    //
    //     await postsTestManager
    //         .createPost(1);
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     await authTestManager
    //         .login(presets.users.map(u => u.login));
    //
    //     const resCreatedComment: Response = await req
    //         .post(`${SETTINGS.PATH.POSTS}/123${SETTINGS.PATH.COMMENTS}`)
    //         .send({
    //             content: comments[0]
    //         })
    //         .set(
    //             'Authorization',
    //             `Bearer ${presets.accessTokens[0].accessToken}`
    //         )
    //         .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);
    //
    //     const resGetComments: Response = await req
    //         .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
    //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //     expect(resGetComments.body.items.length).toEqual(0);
    //
    //     console_log(resCreatedComment.body, resCreatedComment.status, 'Test 3: post(/comments)');
    // });
    // it('should not create a commentary if the data in the request body is incorrect (an empty object is passed).', async () => {
    //     await blogsTestManager
    //         .createBlog(1);
    //
    //     await postsTestManager
    //         .createPost(1);
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     await authTestManager
    //         .login(presets.users.map(u => u.login));
    //
    //     const resCreatedComment: Response = await req
    //         .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
    //         .send({})
    //         .set(
    //             'Authorization',
    //             `Bearer ${presets.accessTokens[0].accessToken}`
    //         )
    //         .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(resCreatedComment.body).toEqual<OutputErrorsType>({
    //         errorsMessages: [
    //             {
    //                 field: 'content',
    //                 message: 'The "content" field must be of the string type.'
    //             }
    //         ]
    //     });
    //
    //     const resGetComments: Response = await req
    //         .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
    //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //     expect(resGetComments.body.items.length).toEqual(0);
    //
    //     console_log(resCreatedComment.body, resCreatedComment.status, 'Test 4: post(/comments)');
    // });
    // it('should not create a commentary if the data in the request body is incorrect (the content field contains data of the number type).', async () => {
    //     await blogsTestManager
    //         .createBlog(1);
    //
    //     await postsTestManager
    //         .createPost(1);
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     await authTestManager
    //         .login(presets.users.map(u => u.login));
    //
    //     const resCreatedComment: Response = await req
    //         .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
    //         .send({
    //             content: 123
    //         })
    //         .set(
    //             'Authorization',
    //             `Bearer ${presets.accessTokens[0].accessToken}`
    //         )
    //         .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(resCreatedComment.body).toEqual<OutputErrorsType>({
    //         errorsMessages: [
    //             {
    //                 field: 'content',
    //                 message: 'The "content" field must be of the string type.'
    //             }
    //         ]
    //     });
    //
    //     const resGetComments: Response = await req
    //         .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
    //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //     expect(resGetComments.body.items.length).toEqual(0);
    //
    //     console_log(resCreatedComment.body, resCreatedComment.status, 'Test 5: post(/comments)');
    // });
    // it('should not create a commentary if the data in the request body is incorrect (the content field is less than 20 characters long).', async () => {
    //     await blogsTestManager
    //         .createBlog(1);
    //
    //     await postsTestManager
    //         .createPost(1);
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     await authTestManager
    //         .login(presets.users.map(u => u.login));
    //
    //     const resCreatedComment: Response = await req
    //         .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
    //         .send({
    //             content: generateRandomString(19)
    //         })
    //         .set(
    //             'Authorization',
    //             `Bearer ${presets.accessTokens[0].accessToken}`
    //         )
    //         .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(resCreatedComment.body).toEqual<OutputErrorsType>({
    //         errorsMessages: [
    //             {
    //                 field: 'content',
    //                 message: 'The length of the "content" field should be from 20 to 300.'
    //             }
    //         ]
    //     });
    //
    //     const resGetComments: Response = await req
    //         .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
    //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //     expect(resGetComments.body.items.length).toEqual(0);
    //
    //     console_log(resCreatedComment.body, resCreatedComment.status, 'Test 6: post(/comments)');
    // });
    // it('should not create a commentary if the data in the request body is incorrect (the content field is more than 300 characters long).', async () => {
    //     await blogsTestManager
    //         .createBlog(1);
    //
    //     await postsTestManager
    //         .createPost(1);
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     await authTestManager
    //         .login(presets.users.map(u => u.login));
    //
    //     const resCreatedComment: Response = await req
    //         .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
    //         .send({
    //             content: generateRandomString(301)
    //         })
    //         .set(
    //             'Authorization',
    //             `Bearer ${presets.accessTokens[0].accessToken}`
    //         )
    //         .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(resCreatedComment.body).toEqual<OutputErrorsType>({
    //         errorsMessages: [
    //             {
    //                 field: 'content',
    //                 message: 'The length of the "content" field should be from 20 to 300.'
    //             }
    //         ]
    //     });
    //
    //     const resGetComments: Response = await req
    //         .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
    //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //     expect(resGetComments.body.items.length).toEqual(0);
    //
    //     console_log(resCreatedComment.body, resCreatedComment.status, 'Test 7: post(/comments)');
    // });
});