import {console_log, encodingAdminDataInBase64, generateRandomString, req} from '../../helpers/test-helpers';
import {SETTINGS} from "../../../src/common/settings";
import {clearPresets, comments, post, presets, user} from "../../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {
    blogsCollection,
    commentsCollection, postsCollection,
    setBlogsCollection,
    setCommentsCollection, setPostsCollection,
    setUsersCollection,
    usersCollection
} from "../../../src/db/mongoDb";
import {postsTestManager} from "../../helpers/posts-test-manager";
import {Response} from "supertest";
import {usersTestManager} from "../../helpers/users-test-manager";
import {SortDirection} from "../../../src/common/types/input-output-types/pagination-sort-types";
import {CommentDbType} from "../../../src/05-comments/types/comment-db-type";
import {UserDbType} from "../../../src/02-users/types/user-db-type";
import {BlogDbType} from "../../../src/03-blogs/types/blog-db-type";
import {PostDbType} from "../../../src/04-posts/types/post-db-type";
import {blogsTestManager} from "../../helpers/blogs-test-manager";
import {CommentViewModel} from "../../../src/05-comments/types/input-output-types";
import {authTestManager} from "../../helpers/auth-test-manager";

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

describe('POST /comments', () => {
    it('should create a new comment if the user is logged in.', async () => {

        const resCreatedBlogs: Response[] = await blogsTestManager
            .createBlog(1);

        const resCreatedPosts: Response[] = await postsTestManager
            .createPost(1);

        const resCreatedUsers: Response[] = await usersTestManager
            .createUser(1);

        const resAuth: Response[] = await authTestManager
            .login([resCreatedUsers[0].body.login]);

        const resCreatedComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${resCreatedPosts[0].body.id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: comments[0]
            })
            .set(
                'Authorization',
                `Bearer ${resAuth[0].body.accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

        expect(resCreatedComment.body).toEqual<CommentViewModel>({
            id: expect.any(String),
            content: comments[0],
            commentatorInfo: {
                userId: resCreatedUsers[0].body.id,
                userLogin: resCreatedUsers[0].body.login
            },
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        });

        const resGetComment: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${resCreatedComment.body.id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment.body).toEqual<CommentViewModel>({
            id: expect.any(String),
            content: resCreatedComment.body.content,
            commentatorInfo: {
                userId: resCreatedUsers[0].body.id,
                userLogin: resCreatedUsers[0].body.login
            },
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        });

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body.items.length).toEqual(1);

        console_log(resCreatedComment.body, resCreatedComment.status, 'Test 1: post(/comments)');
    });
    // it('should not create a user if the admin is not authenticated.', async () => {
    //     const resPost: Response[] = await usersTestManager.createUser(
    //         1,
    //         {
    //             login: user.login,
    //             email: user.email,
    //             password: 'qwerty'
    //         },
    //         encodingAdminDataInBase64(
    //             'incorrect_login',
    //             'incorrect_password'
    //         ),
    //         SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401
    //     );
    //
    //     await req
    //         .get(SETTINGS.PATH.USERS)
    //         .set(
    //             'Authorization',
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         )
    //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //     expect({
    //         pageCount: 0,
    //         page: 1,
    //         pageSize: 10,
    //         totalCount: 0,
    //         items: []
    //     });
    //
    //     console_log(resPost[0].body, resPost[0].status, 'Test 2: post(/users)');
    // });
    // it('should not create a user if the data in the request body is incorrect.', async () => {
    //     const resPost: Response[] = await usersTestManager.createUser(
    //         1,
    //         {},
    //         encodingAdminDataInBase64(
    //             SETTINGS.ADMIN_DATA.LOGIN,
    //             SETTINGS.ADMIN_DATA.PASSWORD
    //         ),
    //         SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
    //     );
    //
    //     expect(resPost[0].body).toEqual(
    //         {
    //             errorsMessages: [
    //                 {
    //                     field: 'login',
    //                     message: 'The "login" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'email',
    //                     message: 'The "email" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'password',
    //                     message: 'The "password" field must be of the string type.'
    //                 },
    //             ]
    //         },
    //     );
    //
    //     await req
    //         .get(SETTINGS.PATH.USERS)
    //         .set(
    //             'Authorization',
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         )
    //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //     expect({
    //         pageCount: 0,
    //         page: 1,
    //         pageSize: 10,
    //         totalCount: 0,
    //         items: []
    //     });
    //
    //     console_log(resPost[0].body, resPost[0].status, 'Test 3: post(/users)');
    // });
    // it('should not create a user if the data in the request body is incorrect.', async () => {
    //     const resPost: Response[] = await usersTestManager.createUser(
    //         1,
    //         {
    //             login: '   ',
    //             email: '   ',
    //             password: '   ',
    //         },
    //         encodingAdminDataInBase64(
    //             SETTINGS.ADMIN_DATA.LOGIN,
    //             SETTINGS.ADMIN_DATA.PASSWORD
    //         ),
    //         SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
    //     );
    //
    //     expect(resPost[0].body).toEqual(
    //         {
    //             errorsMessages: [
    //                 {
    //                     field: 'login',
    //                     message: 'The length of the "login" field should be from 3 to 10.'
    //                 },
    //                 {
    //                     field: 'email',
    //                     message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
    //                 },
    //                 {
    //                     field: 'password',
    //                     message: 'The length of the "password" field should be from 6 to 20.'
    //                 },
    //             ]
    //         },
    //     );
    //
    //     await req
    //         .get(SETTINGS.PATH.USERS)
    //         .set(
    //             'Authorization',
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         )
    //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //     expect({
    //         pageCount: 0,
    //         page: 1,
    //         pageSize: 10,
    //         totalCount: 0,
    //         items: []
    //     });
    //
    //     console_log(resPost[0].body, resPost[0].status, 'Test 4: post(/users)');
    // });
    // it('should not create a user if the data in the request body is incorrect.', async () => {
    //     const resPost: Response[] = await usersTestManager.createUser(
    //         1,
    //         {
    //             login: generateRandomString(11),
    //             email: generateRandomString(10),
    //             password: generateRandomString(21),
    //         },
    //         encodingAdminDataInBase64(
    //             SETTINGS.ADMIN_DATA.LOGIN,
    //             SETTINGS.ADMIN_DATA.PASSWORD
    //         ),
    //         SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
    //     );
    //
    //     expect(resPost[0].body).toEqual(
    //         {
    //             errorsMessages: [
    //                 {
    //                     field: 'login',
    //                     message: 'The length of the "login" field should be from 3 to 10.'
    //                 },
    //                 {
    //                     field: 'email',
    //                     message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
    //                 },
    //                 {
    //                     field: 'password',
    //                     message: 'The length of the "password" field should be from 6 to 20.'
    //                 },
    //             ]
    //         },
    //     );
    //
    //     await req
    //         .get(SETTINGS.PATH.USERS)
    //         .set(
    //             'Authorization',
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         )
    //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //     expect({
    //         pageCount: 0,
    //         page: 1,
    //         pageSize: 10,
    //         totalCount: 0,
    //         items: []
    //     });
    //
    //     console_log(resPost[0].body, resPost[0].status, 'Test 5: post(/users)');
    // });
    // it('should not create a user if the data in the request body is incorrect.', async () => {
    //     const resPost: Response[] = await usersTestManager.createUser(
    //         1,
    //         {
    //             login: 123,
    //             email: 123,
    //             password: 123,
    //         },
    //         encodingAdminDataInBase64(
    //             SETTINGS.ADMIN_DATA.LOGIN,
    //             SETTINGS.ADMIN_DATA.PASSWORD
    //         ),
    //         SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
    //     );
    //
    //     expect(resPost[0].body).toEqual(
    //         {
    //             errorsMessages: [
    //                 {
    //                     field: 'login',
    //                     message: 'The "login" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'email',
    //                     message: 'The "email" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'password',
    //                     message: 'The "password" field must be of the string type.'
    //                 },
    //             ]
    //         },
    //     );
    //
    //     await req
    //         .get(SETTINGS.PATH.USERS)
    //         .set(
    //             'Authorization',
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         )
    //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //     expect({
    //         pageCount: 0,
    //         page: 1,
    //         pageSize: 10,
    //         totalCount: 0,
    //         items: []
    //     });
    //
    //     console_log(resPost[0].body, resPost[0].status, 'Test 6: post(/users)');
    // });
});
