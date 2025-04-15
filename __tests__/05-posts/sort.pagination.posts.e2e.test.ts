import {console_log_e2e, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, postPropertyMap, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
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

describe('pagination, sort /posts', () => {

    it('should use default pagination values when none are provided by the client.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(11);

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
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 11,
            items: postsTestManager.filterAndSort(
                [...presets.posts],
                filter,
                postPropertyMap
            )
        });

        expect(resGetPosts.body.items.length).toEqual(10);

        console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 1: pagination, sort(/posts)');
    }, 10000);

    it('should use client-provided pagination values to return the correct subset of data.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(11);

        const resGetPosts: Response = await req
            .get(SETTINGS.PATH.POSTS)
            .query({
                sortBy: 'title',
                sortDirection: 'asc',
                pageNumber: 2,
                pageSize: 3
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const filter = {
            pageNumber: 2,
            pageSize: 3,
            sortBy: 'title',
            sortDirection: SortDirection.Ascending,
        }

        expect(resGetPosts.body).toEqual({
            pagesCount: 4,
            page: 2,
            pageSize: 3,
            totalCount: 11,
            items: postsTestManager.filterAndSort(
                [...presets.posts],
                filter,
                postPropertyMap
            )
        });

        expect(resGetPosts.body.items.length).toEqual(3);

        console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 2: pagination, sort(/posts)');
    }, 10000);

    it('should use client-provided pagination values to return the correct subset of data (№2).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(11);

        const resGetPosts: Response = await req
            .get(SETTINGS.PATH.POSTS)
            .query({
                sortBy: 'content',
                sortDirection: 'desc',
                pageNumber: 6,
                pageSize: 2
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const filter = {
            pageNumber: 6,
            pageSize: 2,
            sortBy: 'content',
            sortDirection: SortDirection.Descending,
        }

        expect(resGetPosts.body).toEqual({
            pagesCount: 6,
            page: 6,
            pageSize: 2,
            totalCount: 11,
            items: postsTestManager.filterAndSort(
                [...presets.posts],
                filter,
                postPropertyMap
            )
        });

        expect(resGetPosts.body.items.length).toEqual(1);

        console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 3: pagination, sort(/posts)');
    }, 10000);

    it('should use client-provided pagination values to return the correct subset of data (№3).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(11);

        const resGetPosts: Response = await req
            .get(SETTINGS.PATH.POSTS)
            .query({
                sortBy: 'shortDescription',
                sortDirection: 'asc',
                pageNumber: 6,
                pageSize: 2
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const filter = {
            pageNumber: 6,
            pageSize: 2,
            sortBy: 'shortDescription',
            sortDirection: SortDirection.Ascending,
        }

        expect(resGetPosts.body).toEqual({
            pagesCount: 6,
            page: 6,
            pageSize: 2,
            totalCount: 11,
            items: postsTestManager.filterAndSort(
                [...presets.posts],
                filter,
                postPropertyMap
            )
        });

        expect(resGetPosts.body.items.length).toEqual(1);

        expect(resGetPosts.body.items.length).toEqual(1);

        console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 4: pagination, sort(/posts)');
    }, 10000);
});
