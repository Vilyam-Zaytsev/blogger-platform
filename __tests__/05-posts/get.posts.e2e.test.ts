import {console_log_e2e, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, postPropertyMap, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {MongoClient, ObjectId} from "mongodb";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {Response} from "supertest";
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

    describe('GET /posts', () => {

        it('should return an empty array.', async () => {

            const resGetPosts = await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 1: get(/posts)');
        });

        it('should return an array with a single post.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resGetPosts: Response = await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGetPosts.body.items[0]).toEqual(presets.posts[0]);
            expect(resGetPosts.body.items.length).toEqual(1);

            console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 2: get(/posts)');
        });

        it('should return an array with a two posts.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(3);

            const resGetPosts: Response = await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            const filter = {
                pageNumber: 1,
                pageSize: 10,
                sortBy: 'createdAt',
                sortDirection: SortDirection.Descending,
            }

            expect(resGetPosts.body).toEqual({
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 3,
                items: postsTestManager.filterAndSort(
                    [...presets.posts],
                    filter,
                    postPropertyMap
                )
            })

            expect(resGetPosts.body.items.length).toEqual(3);

            console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 3: get(/posts)');
        });

        it('should return post found by id.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resGetPost: Response = await req
                .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGetPost.body).toEqual(presets.posts[0]);

            console_log_e2e(resGetPost.body, resGetPost.status, 'Test 4: get(/posts/:id)');
        });

        it('should return error 404 not found.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resGetPost_1: Response = await req
                .get(`${SETTINGS.PATH.POSTS}/${new ObjectId()}`)
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const resGetPost_2: Response = await req
                .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGetPost_2.body).toEqual(presets.posts[0]);

            console_log_e2e(resGetPost_1.body, resGetPost_1.status, 'Test 5: get(/posts/:id)');
        });
    });
