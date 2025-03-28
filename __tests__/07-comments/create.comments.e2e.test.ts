import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    clearPresets,
    comments,
    incorrectAccessToken,
    presets
} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {
    apiTrafficCollection,
    blogsCollection,
    commentsCollection,
    postsCollection, sessionsCollection, setApiTrafficCollection,
    setBlogsCollection,
    setCommentsCollection,
    setPostsCollection, setSessionsCollection,
    setUsersCollection,
    usersCollection
} from "../../src/db/mongo-db/mongoDb";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {CommentDbType} from "../../src/07-comments/types/comment-db-type";
import {BlogDbType} from "../../src/05-blogs/types/blog-db-type";
import {PostDbType} from "../../src/06-posts/types/post-db-type";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {CommentViewModel} from "../../src/07-comments/types/input-output-types";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {ApiErrorResult} from "../../src/common/types/input-output-types/api-error-result";
import {commentsTestManager} from "../helpers/managers/06_comments-test-manager";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";
import {ApiTrafficType} from "../../src/common/types/api-traffic-type";
import {User} from "../../src/04-users/domain/user-entity";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setUsersCollection(db.collection<User>('users'));
    setBlogsCollection(db.collection<BlogDbType>('blogs'));
    setPostsCollection(db.collection<PostDbType>('posts'));
    setCommentsCollection(db.collection<CommentDbType>('comments'));
    setSessionsCollection(db.collection<ActiveSessionType>('sessions'));
    setApiTrafficCollection(db.collection<ApiTrafficType>('api-traffic'));
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
    await sessionsCollection.deleteMany({});
    await apiTrafficCollection.deleteMany({});

    clearPresets();
});

describe('POST /posts/{postId}/comments', () => {

    it('should create a new comment if the user is logged in.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resCreateComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: comments[0]
            })
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

        expect(resCreateComment.body).toEqual<CommentViewModel>({
            id: expect.any(String),
            content: comments[0],
            commentatorInfo: {
                userId: presets.users[0].id,
                userLogin: presets.users[0].login
            },
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        });

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items[0]).toEqual(resCreateComment.body)
        expect(foundComments.items.length).toEqual(1);

        console_log_e2e(resCreateComment.body, resCreateComment.status, 'Test 1: post(/posts/{postId}/comments)');
    });

    it('should not create a new comment if the user is not logged in.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        const resCreateComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: comments[0]
            })
            .set(
                'Authorization',
                incorrectAccessToken
            )
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(0);

        console_log_e2e(resCreateComment.body, resCreateComment.status, 'Test 2: post(/posts/{postId}/comments)');
    });

    it('should not create a new comment If post with specified postId doesn\'t exists.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resCreateComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/123${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: comments[0]
            })
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(0);

        console_log_e2e(resCreateComment.body, resCreateComment.status, 'Test 3: post(/posts/{postId}/comments)');
    });

    it('should not create a commentary if the data in the request body is incorrect (an empty object is passed).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resCreateComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({})
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreateComment.body).toEqual<ApiErrorResult>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The "content" field must be of the string type.'
                }
            ]
        });

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(0);

        console_log_e2e(resCreateComment.body, resCreateComment.status, 'Test 4: post(/posts/{postId}/comments)');
    });

    it('should not create a commentary if the data in the request body is incorrect (the content field contains data of the number type).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resCreateComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: 123
            })
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreateComment.body).toEqual<ApiErrorResult>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The "content" field must be of the string type.'
                }
            ]
        });

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(0);

        console_log_e2e(resCreateComment.body, resCreateComment.status, 'Test 5: post(/posts/{postId}/comments)');
    });

    it('should not create a commentary if the data in the request body is incorrect (the content field is less than 20 characters long).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resCreateComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: generateRandomString(19)
            })
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreateComment.body).toEqual<ApiErrorResult>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The length of the "content" field should be from 20 to 300.'
                }
            ]
        });

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(0);

        console_log_e2e(resCreateComment.body, resCreateComment.status, 'Test 6: post(/posts/{postId}/comments)');
    });

    it('should not create a commentary if the data in the request body is incorrect (the content field is more than 300 characters long).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resCreateComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: generateRandomString(301)
            })
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreateComment.body).toEqual<ApiErrorResult>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The length of the "content" field should be from 20 to 300.'
                }
            ]
        });

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(0);

        console_log_e2e(resCreateComment.body, resCreateComment.status, 'Test 7: post(/posts/{postId}/comments)');
    });
});
