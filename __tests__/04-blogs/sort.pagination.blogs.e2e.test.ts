import {Response} from "supertest";
import {console_log_e2e, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    blogPropertyMap,
    clearPresets,
    presets
} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import mongoose from "mongoose";
import {runDb} from "../../src/db/mongo-db/mongoDb";
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

describe('pagination, sort, search in term /blogs', () => {

    it('should use default pagination values when none are provided by the client.', async () => {

        await blogsTestManager
            .createBlog(11);

        const resGetBlogs: Response = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const filter = {
            pageNumber: 1,
            pageSize: 10,
            sortBy: 'createdAt',
            sortDirection: SortDirection.Descending
        }

        expect(resGetBlogs.body).toEqual({
            "pagesCount": 2,
            "page": 1,
            "pageSize": 10,
            "totalCount": 11,
            "items": blogsTestManager.filterAndSort(
                [...presets.blogs],
                filter,
                blogPropertyMap
            )
        });

        expect(resGetBlogs.body.items.length).toEqual(10);

        console_log_e2e(resGetBlogs.body, resGetBlogs.status, 'Test 1: pagination(/blogs)');
    });

    it('should use client-provided pagination values to return the correct subset of data.', async () => {

        await blogsTestManager
            .createBlog(11);

        const resGetBlogs: Response = await req
            .get(SETTINGS.PATH.BLOGS)
            .query({
                sortBy: 'name',
                sortDirection: 'asc',
                pageNumber: 2,
                pageSize: 3
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const filter = {
            pageNumber: 2,
            pageSize: 3,
            sortBy: 'name',
            sortDirection: SortDirection.Ascending
        }

        expect(resGetBlogs.body).toEqual({
            pagesCount: 4,
            page: 2,
            pageSize: 3,
            totalCount: 11,
            items: blogsTestManager.filterAndSort(
                [...presets.blogs],
                filter,
                blogPropertyMap
            )
        });

        expect(resGetBlogs.body.items.length).toEqual(3);

        console_log_e2e(resGetBlogs.body, resGetBlogs.status, 'Test 2: pagination(/blogs)');
    });

    it('should use client-provided pagination values to return the correct subset of data.', async () => {

        await blogsTestManager
            .createBlog(11);

        const resGetBlogs: Response = await req
            .get(SETTINGS.PATH.BLOGS)
            .query({
                sortBy: 'description',
                sortDirection: 'desc',
                pageNumber: 6,
                pageSize: 2
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const filter = {
            pageNumber: 6,
            pageSize: 2,
            sortBy: 'description',
            sortDirection: SortDirection.Descending
        }

        expect(resGetBlogs.body).toEqual({
            pagesCount: 6,
            page: 6,
            pageSize: 2,
            totalCount: 11,
            items: blogsTestManager.filterAndSort(
                [...presets.blogs],
                filter,
                blogPropertyMap
            )
        });


        expect(resGetBlogs.body.items.length).toEqual(1);

        console_log_e2e(resGetBlogs.body, resGetBlogs.status, 'Test 3: pagination(/blogs)');
    });

    it('should use client-provided pagination values to return the correct subset of data.', async () => {

        await blogsTestManager
            .createBlog(11);

        const resGetBlogs = await req
            .get(SETTINGS.PATH.BLOGS)
            .query({
                searchNameTerm: 'co',
                sortBy: 'name',
                sortDirection: 'asc',
                pageNumber: 1,
                pageSize: 1
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        const filter = {
            pageNumber: 1,
            pageSize: 1,
            sortBy: 'name',
            sortDirection: SortDirection.Ascending,
            searchNameTerm: 'co'
        }

        expect(resGetBlogs.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 1,
            totalCount: 2,
            items: blogsTestManager.filterAndSort(
                [...presets.blogs],
                filter,
                blogPropertyMap
            )
        });

        expect(resGetBlogs.body.items.length).toEqual(1);

        console_log_e2e(resGetBlogs.body, resGetBlogs.status, 'Test 4: pagination(/blogs)');
    });
});
