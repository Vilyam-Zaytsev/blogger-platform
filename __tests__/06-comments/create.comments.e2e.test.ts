import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, comments, incorrectAccessToken, presets} from "../helpers/datasets-for-tests";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {ApiErrorResult} from "../../src/common/types/input-output-types/api-error-result";
import {commentsTestManager} from "../helpers/managers/06_comments-test-manager";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import mongoose from "mongoose";
import {CommentViewModel} from "../../src/06-comments/domain/comment-entity";
import {LikeStatus} from "../../src/07-likes/like-entity";

beforeAll(async () => {

    const uri = SETTINGS.MONGO_URL;

    if (!uri) {

        throw new Error("MONGO_URL is not defined in SETTINGS");
    }

    await runDb(uri);
});

afterAll(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();

    clearPresets();
});

beforeEach(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();

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
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.None
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
