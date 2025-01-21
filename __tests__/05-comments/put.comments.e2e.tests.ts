import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {
    blogsCollection, commentsCollection, postsCollection,
    setBlogsCollection,
    setCommentsCollection,
    setPostsCollection,
    setUsersCollection, usersCollection
} from "../../src/db/mongoDb";
import {UserDbType} from "../../src/02-users/types/user-db-type";
import {BlogDbType} from "../../src/03-blogs/types/blog-db-type";
import {PostDbType} from "../../src/04-posts/types/post-db-type";
import {CommentDbType} from "../../src/05-comments/types/comment-db-type";
import {clearPresets, comments, incorrectAccessToken, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/03_blogs-test-manager";
import {postsTestManager} from "../helpers/managers/04_posts-test-manager";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {Response} from "supertest";
import {console_log, generateRandomString, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {CommentViewModel} from "../../src/05-comments/types/input-output-types";
import {OutputErrorsType} from "../../src/common/types/input-output-types/output-errors-type";
import {commentsTestManager} from "../helpers/managers/05_comments-test-manager";

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

        const resPutComments: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const resGetComment: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment.body).toEqual<CommentViewModel>({

            id: presets.comments[0].id,
            content: comments[1],
            commentatorInfo: {
                userId: presets.users[0].id,
                userLogin: presets.users[0].login
            },
            createdAt: presets.comments[0].createdAt
        })

        console_log(resPutComments.body, resPutComments.status, 'Test 1: put(/comments)');
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

        const resPutComments: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                incorrectAccessToken
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const resGetComment: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment.body).toEqual<CommentViewModel>(presets.comments[0])

        console_log(resPutComments.body, resPutComments.status, 'Test 2: put(/comments)');
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

        const resPutComments: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .send({})
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPutComments.body).toEqual<OutputErrorsType>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The "content" field must be of the string type.'
                }
            ]
        });

        const resGetComment: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment.body).toEqual<CommentViewModel>(presets.comments[0])

        console_log(resPutComments.body, resPutComments.status, 'Test 3: put(/comments)');
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

        const resPutComments: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .send({
                content: 123
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPutComments.body).toEqual<OutputErrorsType>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The "content" field must be of the string type.'
                }
            ]
        });

        const resGetComment: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment.body).toEqual<CommentViewModel>(presets.comments[0])

        console_log(resPutComments.body, resPutComments.status, 'Test 4: put(/comments)');
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

        const resPutComments: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .send({
                content: generateRandomString(19)
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPutComments.body).toEqual<OutputErrorsType>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The length of the "content" field should be from 20 to 300.'
                }
            ]
        });

        const resGetComment: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment.body).toEqual<CommentViewModel>(presets.comments[0])

        console_log(resPutComments.body, resPutComments.status, 'Test 5: put(/comments)');
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

        const resPutComments: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .send({
                content: generateRandomString(301)
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPutComments.body).toEqual<OutputErrorsType>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The length of the "content" field should be from 20 to 300.'
                }
            ]
        });

        const resGetComment: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment.body).toEqual<CommentViewModel>(presets.comments[0])

        console_log(resPutComments.body, resPutComments.status, 'Test 6: put(/comments)');
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

        const resPutComments_1: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[1].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.FORBIDDEN_403);

        const resPutComments_2: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        console_log(resPutComments_1.body, resPutComments_1.status, 'Test 7: put(/comments)');
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

        const resPutComments: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${new ObjectId()}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const resGetComment: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200)

        expect(resGetComment.body).toEqual<CommentViewModel>(presets.comments[0]);

        console_log(resPutComments.body, resPutComments.status, 'Test 8: put(/comments)');
    });
});