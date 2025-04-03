import {ObjectId} from "mongodb";

import {clearPresets, incorrectAccessToken, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {Response} from "supertest";
import {console_log_e2e, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {CommentViewModel} from "../../src/07-comments/types/input-output-types";
import {commentsTestManager} from "../helpers/managers/06_comments-test-manager";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import mongoose from "mongoose";

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

describe('DELETE /comments', () => {

    it('should delete the comment if the user is logged in.', async () => {

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

        const resDeleteComment: Response = await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(0);

        console_log_e2e(resDeleteComment.body, resDeleteComment.status, 'Test 1: delete(/comments/:id)');
    });

    it('should not delete the comment if the user is not logged in.', async () => {

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

        const resDeleteComment: Response = await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                incorrectAccessToken
            )
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(1);

        console_log_e2e(resDeleteComment.body, resDeleteComment.status, 'Test 2: delete(/comments/:id)');
    });

    it('should not delete comments if the user in question is not the owner of the comment.', async () => {

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

        const resDeleteComment: Response = await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[1].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.FORBIDDEN_403);

        await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        console_log_e2e(resDeleteComment.body, resDeleteComment.status, 'Test 3: delete(/comments/:id)');
    });

    it('should not delete comments if the comment does not exist.', async () => {

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

        const resDeleteComment: Response = await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${new ObjectId()}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(1);

        console_log_e2e(resDeleteComment.body, resDeleteComment.status, 'Test 4: delete(/comments/:id)');
    });
});