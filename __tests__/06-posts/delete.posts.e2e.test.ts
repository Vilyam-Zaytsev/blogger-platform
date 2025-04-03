import {console_log_e2e, encodingAdminDataInBase64, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {ObjectId} from "mongodb";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {Response} from "supertest";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {PostViewModel} from "../../src/06-posts/types/input-output-types";
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

    describe('DELETE /posts', () => {

        it('should delete post, the admin is authenticated.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resDeletePost: Response = await req
                .delete(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            const foundPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(foundPosts.items.length).toEqual(0);

            console_log_e2e(resDeletePost.body, resDeletePost.status, 'Test 1: delete(/posts/:id)');
        });

        it('should not delete blog, the admin is not authenticated.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resDeletePost: Response = await req
                .delete(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const foundPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(foundPosts.items[0]).toEqual(presets.posts[0]);
            expect(foundPosts.items.length).toEqual(1);

            console_log_e2e(resDeletePost.body, resDeletePost.status, 'Test 2: delete(/posts/:id)');
        });

        it('should return a 404 error if the blog was not found by the passed ID in the parameters.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resDeletePost: Response = await req
                .delete(`${SETTINGS.PATH.POSTS}/${new ObjectId()}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const foundPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(foundPosts.items[0]).toEqual(presets.posts[0]);
            expect(foundPosts.items.length).toEqual(1);

            console_log_e2e(resDeletePost.body, resDeletePost.status, 'Test 3: delete(/posts/:id)');
        });
    });
