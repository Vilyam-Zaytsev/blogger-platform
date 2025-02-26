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
import {MongoClient} from "mongodb";
import {blogsCollection, setBlogsCollection} from "../../src/db/mongoDb";
import {BlogDbType} from "../../src/05-blogs/types/blog-db-type";
import {createPaginationAndSortFilter} from "../../src/common/helpers/create-pagination-and-sort-filter";
import {SortDirection} from "../../src/common/types/input-output-types/pagination-sort-types";

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

    describe('pagination, sort, search in term /blogs', () => {

        it('should use default pagination values when none are provided by the client.', async () => {

            await blogsTestManager
                .createBlog(11);

            const resGetBlogs: Response = await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGetBlogs.body).toEqual({
                "pagesCount": 2,
                "page": 1,
                "pageSize": 10,
                "totalCount": 11,
                "items": blogsTestManager.filterAndSort(
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

            expect(resGetBlogs.body).toEqual({
                pagesCount: 4,
                page: 2,
                pageSize: 3,
                totalCount: 11,
                items: blogsTestManager.filterAndSort(
                    [...presets.blogs],
                    createPaginationAndSortFilter({
                        pageNumber: '2',
                        pageSize: '3',
                        sortBy: 'name',
                        sortDirection: SortDirection.Ascending
                    }),
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

            expect(resGetBlogs.body).toEqual({
                pagesCount: 6,
                page: 6,
                pageSize: 2,
                totalCount: 11,
                items: blogsTestManager.filterAndSort(
                    [...presets.blogs],
                    createPaginationAndSortFilter({
                        pageNumber: '6',
                        pageSize: '2',
                        sortBy: 'description',
                        sortDirection: SortDirection.Descending
                    }),
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

            expect(resGetBlogs.body).toEqual({
                pagesCount: 2,
                page: 1,
                pageSize: 1,
                totalCount: 2,
                items: blogsTestManager.filterAndSort(
                    [...presets.blogs],
                    createPaginationAndSortFilter({
                        pageNumber: '1',
                        pageSize: '1',
                        sortBy: 'name',
                        sortDirection: SortDirection.Ascending,
                        searchNameTerm: 'co'
                    }),
                    blogPropertyMap
                )
            });

            expect(resGetBlogs.body.items.length).toEqual(1);

            console_log_e2e(resGetBlogs.body, resGetBlogs.status, 'Test 4: pagination(/blogs)');
        });
    });
