import {clearPresets, commentPropertyMap, presets,} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {Response} from "supertest";
import {console_log_e2e, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {commentsTestManager} from "../helpers/managers/06_comments-test-manager";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import mongoose from "mongoose";
import {SortDirection} from "../../src/common/helpers/sort-query-dto";
import {CommentViewModel} from "../../src/06-comments/domain/comment-entity";

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

describe('pagination and sort /comments', () => {

    it('should use default pagination values when none are provided by the client.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(11);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const filter = {
            pageNumber: 1,
            pageSize: 10,
            sortBy: 'createdAt',
            sortDirection: SortDirection.Descending
        };

        for (let i = 0; i < resGetComments.body.items.length; i++) {
            expect(resGetComments.body.items[i]).toEqual(
                commentsTestManager.filterAndSort<CommentViewModel>(
                    [...presets.comments],
                    filter,
                    commentPropertyMap
                )[i]
            );
        }

        expect(resGetComments.body.items.length).toEqual(10);

        expect(presets.comments.length).toEqual(11);

        console_log_e2e(resGetComments.body, resGetComments.status, 'Test 1: pagination and' +
            ' sort(/posts/{postId}/comments)');
    }, 10000);

    it('should use client-provided pagination values to return the correct subset of data.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(5);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(11, 5);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .query({
                pageNumber: 2,
                pageSize: 3,
                sortBy: 'commentatorInfo.userLogin',
                sortDirection: SortDirection.Ascending,
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const filter = {
            pageNumber: 2,
            pageSize: 3,
            sortBy: 'userLogin',
            sortDirection: SortDirection.Ascending
        };

        for (let i = 0; i < resGetComments.body.items.length; i++) {
            expect(resGetComments.body.items[i]).toEqual(
                commentsTestManager.filterAndSort<CommentViewModel>(
                    [...presets.comments],
                    filter,
                    commentPropertyMap
                )[i]
            );
        }

        expect(resGetComments.body.items.length).toEqual(3);

        expect(presets.comments.length).toEqual(11);

        console_log_e2e(resGetComments.body, resGetComments.status, 'Test 2: pagination and sort(/posts/{postId}/comments)');
    }, 15000);

    it('should return a 400 error if the client has passed invalid pagination values.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(11);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .query({
                pageNumber: 'xxx',
                pageSize: 'xxx',
                sortBy: 123,
                sortDirection: 'xxx',
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resGetComments.body).toEqual({
            errorsMessages: [
                {
                    field: 'pageNumber',
                    message: 'The "pageNumber" field must be a positive integer.'
                },
                {
                    field: 'pageSize',
                    message: 'The "pageSize" field must be a positive integer.'
                },
                {
                    field: 'sortDirection',
                    message: 'The "SortDirection" field must contain "asc" | "desc".'
                }
            ]
        })

        expect(presets.comments.length).toEqual(11);

        console_log_e2e(resGetComments.body, resGetComments.status, 'Test 3: pagination and sort(/posts/{postId}/comments)');
    }, 10000);
});