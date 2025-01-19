import {console_log, generateRandomString, req} from '../../helpers/test-helpers';
import {SETTINGS} from "../../../src/common/settings";
import {clearPresets, comments, incorrectAccessToken, post, presets, user} from "../../helpers/datasets-for-tests";
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
import {CommentDbType} from "../../../src/05-comments/types/comment-db-type";
import {UserDbType} from "../../../src/02-users/types/user-db-type";
import {BlogDbType} from "../../../src/03-blogs/types/blog-db-type";
import {PostDbType} from "../../../src/04-posts/types/post-db-type";
import {blogsTestManager} from "../../helpers/blogs-test-manager";
import {CommentViewModel} from "../../../src/05-comments/types/input-output-types";
import {authTestManager} from "../../helpers/auth-test-manager";
import {OutputErrorsType} from "../../../src/common/types/input-output-types/output-errors-type";

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

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resCreatedComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: comments[0]
            })
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

        expect(resCreatedComment.body).toEqual<CommentViewModel>({
            id: expect.any(String),
            content: comments[0],
            commentatorInfo: {
                userId: presets.users[0].id,
                userLogin: presets.users[0].login
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
                userId: presets.users[0].id,
                userLogin: presets.users[0].login
            },
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        });

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body.items.length).toEqual(1);

        console_log(resCreatedComment.body, resCreatedComment.status, 'Test 1: post(/comments)');
    });
    it('should not create a new comment if the user is not logged in.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        const resCreatedComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: comments[0]
            })
            .set(
                'Authorization',
                incorrectAccessToken
            )
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body.items.length).toEqual(0);

        console_log(resCreatedComment.body, resCreatedComment.status, 'Test 2: post(/comments)');
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

        const resCreatedComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/123${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: comments[0]
            })
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body.items.length).toEqual(0);

        console_log(resCreatedComment.body, resCreatedComment.status, 'Test 3: post(/comments)');
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

        const resCreatedComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({})
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatedComment.body).toEqual<OutputErrorsType>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The "content" field must be of the string type.'
                }
            ]
        });

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body.items.length).toEqual(0);

        console_log(resCreatedComment.body, resCreatedComment.status, 'Test 4: post(/comments)');
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

        const resCreatedComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: 123
            })
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatedComment.body).toEqual<OutputErrorsType>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The "content" field must be of the string type.'
                }
            ]
        });

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body.items.length).toEqual(0);

        console_log(resCreatedComment.body, resCreatedComment.status, 'Test 5: post(/comments)');
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

        const resCreatedComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: generateRandomString(19)
            })
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatedComment.body).toEqual<OutputErrorsType>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The length of the "content" field should be from 20 to 300.'
                }
            ]
        });

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body.items.length).toEqual(0);

        console_log(resCreatedComment.body, resCreatedComment.status, 'Test 6: post(/comments)');
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

        const resCreatedComment: Response = await req
            .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .send({
                content: generateRandomString(301)
            })
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatedComment.body).toEqual<OutputErrorsType>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The length of the "content" field should be from 20 to 300.'
                }
            ]
        });

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body.items.length).toEqual(0);

        console_log(resCreatedComment.body, resCreatedComment.status, 'Test 7: post(/comments)');
    });
});
