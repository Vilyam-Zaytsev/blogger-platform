import {console_log_e2e, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    clearPresets,
    postPropertyMap,
    presets
} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/03_blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {blogsCollection, postsCollection, setBlogsCollection, setPostsCollection} from "../../src/db/mongoDb";
import {BlogDbType} from "../../src/03-blogs/types/blog-db-type";
import {PostDbType} from "../../src/04-posts/types/post-db-type";
import {postsTestManager} from "../helpers/managers/04_posts-test-manager";
import {Response} from "supertest";
import {SortDirection} from "../../src/common/types/input-output-types/pagination-sort-types";
import {createPaginationAndSortFilter} from "../../src/common/helpers/create-pagination-and-sort-filter";

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

    describe('GET /blogs/{blogId}/posts', () => {

        it('should return all posts from a specific blog.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(3);

            const resGetPosts: Response = await req
                .get(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}${SETTINGS.PATH.POSTS}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGetPosts.body).toEqual({
                "pagesCount": 1,
                "page": 1,
                "pageSize": 10,
                "totalCount": 3,
                "items": postsTestManager.filterAndSort(
                    [...presets.posts],
                    createPaginationAndSortFilter({
                        pageNumber: '1',
                        pageSize: '10',
                        sortBy: 'createdAt',
                        sortDirection: SortDirection.Descending
                    }),
                    postPropertyMap
                )
            });
            expect(resGetPosts.body.items.length).toEqual(3);

            console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 1: get(/blogs/{blogId}/posts)');
        });

        it('should return all entries from a specific blog using the pagination values provided by the client.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(11);

            const resGetPosts: Response = await req
                .get(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}${SETTINGS.PATH.POSTS}`)
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
            })

            expect(resGetPosts.body.items.length).toEqual(3);

            console_log_e2e(resGetPosts.body, resGetPosts.status, 'Test 2: get(/blogs/{blogId}/posts)');
        });

        it('should return a 404 error if the benefit does not exist.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(11);

            const resGetPosts_1: Response = await req
                .get(`${SETTINGS.PATH.BLOGS}/${new ObjectId()}${SETTINGS.PATH.POSTS}`)
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const resGetPosts_2: Response = await req
                .get(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}${SETTINGS.PATH.POSTS}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGetPosts_2.body.items.length).toEqual(10);

            console_log_e2e(resGetPosts_1.body, resGetPosts_1.status, 'Test 3: get(/blogs/{blogId}/posts)');
        })
    });
