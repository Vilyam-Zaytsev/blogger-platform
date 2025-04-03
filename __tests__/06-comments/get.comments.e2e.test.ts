import {ObjectId} from "mongodb";
import {clearPresets, commentPropertyMap, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {Response} from "supertest";
import {console_log_e2e, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {CommentViewModel} from "../../src/06-comments/types/input-output-types";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {commentsTestManager} from "../helpers/managers/06_comments-test-manager";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import mongoose from "mongoose";
import {SortDirection} from "../../src/common/helpers/sort-query-dto";

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

describe('GET /posts/{postId}/comments', () => {

    it('should return an empty array.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComments.body).toEqual<Paginator<CommentViewModel>>({
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        });

        console_log_e2e(resGetComments.body, resGetComments.status, 'Test 1: get(/posts/{postId}/comments)');
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

        expect(resGetComments.body).toEqual<Paginator<CommentViewModel>>({
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

        console_log_e2e(resGetComments.body, resGetComments.status, 'Test 2: get(/posts/{postId}/comments)');
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

        const filter = {
            pageNumber: 1,
            pageSize: 10,
            sortBy: 'createdAt',
            sortDirection: SortDirection.Descending
        };

        for (let i = 0; i < resGetComments.body.items.length; i++) {
            expect(resGetComments.body.items[i]).toEqual(
                commentsTestManager.filterAndSort<CommentViewModel>(
                    presets.comments,
                    filter,
                    commentPropertyMap
                )[i]
            );
        }

        expect(resGetComments.body.items.length).toEqual(3);

        console_log_e2e(resGetComments.body, resGetComments.status, 'Test 3: get(/posts/{postId}/comments)');
    });

    it('should return comment found by id.', async () => {

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

        const resGetComment = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment.body).toEqual(presets.comments[0])

        console_log_e2e(resGetComment.body, resGetComment.status, 'Test 4: get(/comments/:id)');
    });

    it('should return the 404 not found error (if the comment with this ID does not exist).', async () => {

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

        const resGetComment_1: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${new ObjectId()}`)
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const resGetComment_2: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment_2.body).toEqual(presets.comments[0])

        console_log_e2e(resGetComment_1.body, resGetComment_1.status, 'Test 5: get(/comments/:id)');
    });
});