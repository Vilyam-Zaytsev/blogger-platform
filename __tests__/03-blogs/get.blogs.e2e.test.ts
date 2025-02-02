import {Response} from "supertest";
import {console_log_e2e, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    blogPropertyMap,
    clearPresets,
    presets
} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/03_blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {blogsCollection, setBlogsCollection} from "../../src/db/mongoDb";
import {BlogDbType} from "../../src/03-blogs/types/blog-db-type";
import {createPaginationAndSortFilter} from "../../src/common/helpers/create-pagination-and-sort-filter";
import {SortDirection} from "../../src/common/types/input-output-types/pagination-sort-types";
import {BlogViewModel} from "../../src/03-blogs/types/input-output-types";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setBlogsCollection(db.collection<BlogDbType>('blogs'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await blogsCollection.deleteMany({});

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

        expect(resGetBlogs.body).toEqual({
            "pagesCount": 1,
            "page": 1,
            "pageSize": 10,
            "totalCount": presets.blogs.length,
            "items": blogsTestManager.filterAndSort<BlogViewModel>(
                [...presets.blogs],
                createPaginationAndSortFilter({
                    pageNumber: '1',
                    pageSize: '10',
                    sortBy: 'createdAt',
                    sortDirection: SortDirection.Descending
                }),
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
