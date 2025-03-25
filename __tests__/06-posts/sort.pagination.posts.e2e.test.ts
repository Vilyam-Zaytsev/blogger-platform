import {console_log_e2e, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    clearPresets,
    postPropertyMap,
    presets
} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {
    blogsCollection,
    postsCollection,
    setBlogsCollection,
    setPostsCollection
} from "../../src/db/mongo-db/mongoDb";
import {BlogDbType} from "../../src/05-blogs/types/blog-db-type";
import {PostDbType} from "../../src/06-posts/types/post-db-type";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {Response} from "supertest";
import {createPaginationAndSortFilter} from "../../src/common/helpers/sort-query-dto";
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
    setPostsCollection(db.collection<PostDbType>('posts'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});

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

        expect(resGetPosts.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 11,
            items: postsTestManager.filterAndSort(
                [...presets.posts],
                createPaginationAndSortFilter({
                    pageNumber: '1',
                    pageSize: '10',
                    sortBy: 'createdAt',
                    sortDirection: SortDirection.Descending,
                }),
                postPropertyMap
            )
        });

        expect(resGetPosts.body.items.length).toEqual(10);

        console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 1: pagination, sort(/posts)');
    });

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

        expect(resGetPosts.body).toEqual({
            pagesCount: 4,
            page: 2,
            pageSize: 3,
            totalCount: 11,
            items: postsTestManager.filterAndSort(
                [...presets.posts],
                createPaginationAndSortFilter({
                    pageNumber: '2',
                    pageSize: '3',
                    sortBy: 'title',
                    sortDirection: SortDirection.Ascending,
                }),
                postPropertyMap
            )
        });

        expect(resGetPosts.body.items.length).toEqual(3);

        console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 2: pagination, sort(/posts)');
    });

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

        expect(resGetPosts.body).toEqual({
            pagesCount: 6,
            page: 6,
            pageSize: 2,
            totalCount: 11,
            items: postsTestManager.filterAndSort(
                [...presets.posts],
                createPaginationAndSortFilter({
                    pageNumber: '6',
                    pageSize: '2',
                    sortBy: 'content',
                    sortDirection: SortDirection.Descending,
                }),
                postPropertyMap
            )
        });

        expect(resGetPosts.body.items.length).toEqual(1);

        console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 3: pagination, sort(/posts)');
    });

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

        expect(resGetPosts.body).toEqual({
            pagesCount: 6,
            page: 6,
            pageSize: 2,
            totalCount: 11,
            items: postsTestManager.filterAndSort(
                [...presets.posts],
                createPaginationAndSortFilter({
                    pageNumber: '6',
                    pageSize: '2',
                    sortBy: 'shortDescription',
                    sortDirection: SortDirection.Ascending,
                }),
                postPropertyMap
            )
        });

        expect(resGetPosts.body.items.length).toEqual(1);

        expect(resGetPosts.body.items.length).toEqual(1);

        console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 4: pagination, sort(/posts)');
    });
});
