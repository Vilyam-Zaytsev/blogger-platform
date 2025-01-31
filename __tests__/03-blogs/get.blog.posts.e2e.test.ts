import {console_log, encodingAdminDataInBase64, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    blog, blogPropertyMap,
    clearPresets,
    post,
    postContents, postPropertyMap,
    postShortDescriptions,
    postTitles,
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
import {PostViewModel} from "../../src/04-posts/types/input-output-types";
import {Paginator, SortDirection} from "../../src/common/types/input-output-types/pagination-sort-types";
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

            const resGetPosts = await req
                .get(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}${SETTINGS.PATH.POSTS}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGetPosts.body).toEqual({
                "pagesCount": 1,
                "page": 1,
                "pageSize": 10,
                "totalCount": 3,
                "items": postsTestManager.filterAndSort(
                    presets.posts,
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

            console_log(resGetPosts.body, resGetPosts.status, 'Test 1: get(/blogs/{blogId}/posts)');
        });

        // it('should return all entries from a specific blog using the pagination values provided by the client.', async () => {
        //     const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
        //         1,
        //         {
        //             name: blog.name,
        //             description: blog.description,
        //             websiteUrl: blog.websiteUrl
        //         },
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         )
        //     );
        //
        //     expect(res_POST_blogs[0].body).toEqual({
        //         id: expect.any(String),
        //         name: `${blog.name}_1`,
        //         description: `${blog.description}_1`,
        //         websiteUrl: blog.websiteUrl,
        //         isMembership: blog.isMembership,
        //         createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        //     });
        //
        //     const res_POST_posts: Response[] = await postsTestManager.createPost(
        //         11,
        //         {
        //             title: post.title,
        //             shortDescription: post.shortDescription,
        //             content: post.content,
        //             blogId: res_POST_blogs[0].body.id
        //         },
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         )
        //     );
        //
        //     for (let i = 0; i < res_POST_posts.length; i++) {
        //         expect(res_POST_posts[i].body).toEqual({
        //             id: expect.any(String),
        //             title: `${post.title}_${i + 1}`,
        //             shortDescription: `${post.shortDescription}_${i + 1}`,
        //             content: `${post.content}_${i + 1}`,
        //             blogId: res_POST_blogs[0].body.id,
        //             blogName: res_POST_blogs[0].body.name,
        //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        //         });
        //     }
        //
        //     const res_GET_posts = await req
        //         .get(`${SETTINGS.PATH.BLOGS}/${res_POST_blogs[0].body.id}${SETTINGS.PATH.POSTS}`)
        //         .query({
        //             sortBy: 'title',
        //             sortDirection: 'asc',
        //             pageNumber: 2,
        //             pageSize: 3
        //         })
        //         .expect(SETTINGS.HTTP_STATUSES.OK_200);
        //
        //     expect(res_GET_posts.body).toEqual({
        //         pagesCount: 4,
        //         page: 2,
        //         pageSize: 3,
        //         totalCount: 11,
        //         items: postsTestManager.filterAndSort(
        //             res_POST_posts.map(r => r.body),
        //             'title',
        //             'asc',
        //             2,
        //             3
        //         )
        //     })
        //
        //     for (let i = 0; i < res_GET_posts.body.items.length; i++) {
        //         expect(res_GET_posts.body.items[i]).toEqual(
        //             postsTestManager.filterAndSort(
        //                 res_POST_posts.map(r => r.body),
        //                 'title',
        //                 'asc',
        //                 2,
        //                 3
        //             )[i]
        //         );
        //     }
        //
        //     expect(res_GET_posts.body.items.length).toEqual(3);
        //
        //     console_log(res_GET_posts.body, res_GET_posts.status, 'Test 2: get(/blogs/{blogId}/posts)');
        // })
    });
