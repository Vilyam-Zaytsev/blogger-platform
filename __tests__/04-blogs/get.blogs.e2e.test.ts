import {Response} from "supertest";
import {console_log_e2e, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {blogPropertyMap, clearPresets, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {MongoClient, ObjectId} from "mongodb";
import {BlogViewModel} from "../../src/04-blogs/types/input-output-types";
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


describe('GET /blogs', () => {

    it('should return an empty array.', async () => {

        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(SETTINGS.HTTP_STATUSES.OK_200)

        expect(res.body).toEqual({
            "pagesCount": 0,
            "page": 1,
            "pageSize": 10,
            "totalCount": 0,
            "items": []
        })

        console_log_e2e(res.body, res.status, 'Test 1: get(/blogs)');
    });

    it('should return an array with a single blog.', async () => {

        await blogsTestManager
            .createBlog(1);

        const resGetBlogs: Response = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetBlogs.body).toEqual({
            "pagesCount": 1,
            "page": 1,
            "pageSize": 10,
            "totalCount": 1,
            "items": [...presets.blogs]
        });

        expect(resGetBlogs.body.items.length).toEqual(1);
        expect(presets.blogs.length).toEqual(1);


        console_log_e2e(resGetBlogs.body, resGetBlogs.status, 'Test 2: get(/blogs)');
    });

    it('should return an array with a three blogs.', async () => {

        await blogsTestManager
            .createBlog(3);

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
            "pagesCount": 1,
            "page": 1,
            "pageSize": 10,
            "totalCount": presets.blogs.length,
            "items": blogsTestManager.filterAndSort<BlogViewModel>(
                [...presets.blogs],
                filter,
                blogPropertyMap
            )
        });

        expect(resGetBlogs.body.items.length).toEqual(3);
        expect(presets.blogs.length).toEqual(3);

        console_log_e2e(resGetBlogs.body, resGetBlogs.status, 'Test 3: get(/blogs)');
    });

    it('should return blog found by id.', async () => {

        await blogsTestManager
            .createBlog(1);

        const resGetBlog: Response = await req
            .get(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetBlog.body).toEqual(presets.blogs[0]);

        console_log_e2e(resGetBlog.body, resGetBlog.status, 'Test 4: get(/blogs)');
    });

    it('should return error 404 not found.', async () => {

        await blogsTestManager
            .createBlog(1);

        const resGetBlog_1: Response = await req
            .get(`${SETTINGS.PATH.BLOGS}/${new ObjectId()}`)
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404, {});

        const resGetBlog_2: Response = await req
            .get(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetBlog_2.body).toEqual(presets.blogs[0]);

        console_log_e2e(resGetBlog_1.body, resGetBlog_1.status, 'Test 5: get(/blogs)');
    });
});
