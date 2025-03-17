import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {
    blogsCollection,
    commentsCollection,
    postsCollection,
    usersCollection,
    setBlogsCollection,
    setCommentsCollection,
    setPostsCollection,
    setUsersCollection, setSessionsCollection, setApiTrafficCollection, sessionsCollection, apiTrafficCollection,
} from "../../src/db/mongo-db/mongoDb";
import {BlogDbType} from "../../src/05-blogs/types/blog-db-type";
import {PostDbType} from "../../src/06-posts/types/post-db-type";
import {CommentDbType} from "../../src/07-comments/types/comment-db-type";
import {
    clearPresets,
    comments,
    incorrectAccessToken,
    presets
} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {Response} from "supertest";
import {console_log_e2e, generateRandomString, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {CommentViewModel} from "../../src/07-comments/types/input-output-types";
import {ApiErrorResult} from "../../src/common/types/input-output-types/api-error-result";
import {commentsTestManager} from "../helpers/managers/06_comments-test-manager";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";
import {ApiTrafficType} from "../../src/common/types/api-traffic-type";
import {User} from "../../src/04-users/domain/user.entity";

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

describe('PUT /comments', () => {

    it('should update the comment if the user is logged in.', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundComment: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment).toEqual<CommentViewModel>({

            id: presets.comments[0].id,
            content: comments[1],
            commentatorInfo: {
                userId: presets.users[0].id,
                userLogin: presets.users[0].login
            },
            createdAt: presets.comments[0].createdAt
        });

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 1: put(/comments/:id)');
    });

    it('should not update the comment if the user is not logged in.', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                incorrectAccessToken
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const foundComment: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment).toEqual<CommentViewModel>(presets.comments[0]);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 2: put(/comments/:id)');
    });

    it('should not update the comment if the data in the request body is incorrect (an empty object is passed).', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({})
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPutComment.body).toEqual<ApiErrorResult>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The "content" field must be of the string type.'
                }
            ]
        });

        const foundComment: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment).toEqual<CommentViewModel>(presets.comments[0]);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 3: put(/comments/:id)');
    });

    it('should not update the comment if the data in the request body is incorrect (the content field contains data of the number type).', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                content: 123
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPutComment.body).toEqual<ApiErrorResult>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The "content" field must be of the string type.'
                }
            ]
        });

        const foundComment: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment).toEqual<CommentViewModel>(presets.comments[0]);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 4: put(/comments/:id)');
    });

    it('should not update the comment if the data in the request body is incorrect (the content field is less than 20 characters long).', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                content: generateRandomString(19)
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPutComment.body).toEqual<ApiErrorResult>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The length of the "content" field should be from 20 to 300.'
                }
            ]
        });

        const foundComment: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment).toEqual<CommentViewModel>(presets.comments[0]);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 5: put(/comments/:id)');
    });

    it('should not update the comment if the data in the request body is incorrect (the content field is more than 300 characters long).', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                content: generateRandomString(301)
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPutComment.body).toEqual<ApiErrorResult>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The length of the "content" field should be from 20 to 300.'
                }
            ]
        });

        const foundComment: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment).toEqual<CommentViewModel>(presets.comments[0]);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 6: put(/comments/:id)');
    });

    it('should not update comments if the user in question is not the owner of the comment.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(2);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(1);

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[1].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.FORBIDDEN_403);

        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 7: put(/comments/:id)');
    });

    it('should not update comments if the comment does not exist.', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${new ObjectId()}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const foundComment: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment).toEqual<CommentViewModel>(presets.comments[0]);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 8: put(/comments/:id)');
    });
});