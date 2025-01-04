import {console_log, encodingAdminDataInBase64, generateRandomString, req} from './helpers/test-helpers';
import {SETTINGS} from "../src/settings";
import {blog, post} from "./helpers/datasets-for-tests";
import {blogsTestManager} from "./helpers/blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {postsCollection, setBlogsCollection, setPostsCollection} from "../src/db/mongoDb";
import {BlogDbType} from "../src/types/db-types/blog-db-type";
import {PostDbType} from "../src/types/db-types/post-db-type";
import {postsTestManager} from "./helpers/posts-test-manager";
import {Response} from "supertest";

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
    await postsCollection.deleteMany({});
});


describe('/posts', () => {
    describe('POST /posts', () => {
        it('should create a new post, the user is authenticated.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );


            for (let i = 0; i < res_POST_posts.length; i++) {
                expect(res_POST_posts[i].body).toEqual({
                    id: expect.any(String),
                    title: `${post.title}_${i + 1}`,
                    shortDescription: `${post.shortDescription}_${i + 1}`,
                    content: `${post.content}_${i + 1}`,
                    blogId: res_POST_blogs[0].body.id,
                    blogName: res_POST_blogs[0].body.name,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            for (let i = 0; i < res_POST_posts.length; i++) {
                const res_GET_post = await req
                    .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[i].body.id}`)
                    .expect(SETTINGS.HTTP_STATUSES.OK_200);

                expect(res_POST_posts[i].body).toEqual(res_GET_post.body);
            }

            console_log(res_POST_posts[0].body, res_POST_posts[0].status, 'Test 1: post(/posts)\n');
        });
        it('should not create a post if the user is not authenticated.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    'incorrect_login',
                    'incorrect_password'
                ),
                SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401
            );

            await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            console_log(res_POST_posts[0].body, res_POST_posts[0].status, 'Test 2: post(/posts)\n');
        });
        it('should not create a post if the data in the request body is incorrect.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {},
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            expect(res_POST_posts[0].body).toEqual(
                {
                    errorsMessages: [
                        {
                            field: 'title',
                            message: 'The "title" field must be of the string type.'
                        },
                        {
                            field: 'shortDescription',
                            message: 'The "shortDescription" field must be of the string type.'
                        },
                        {
                            field: 'content',
                            message: 'The "content" field must be of the string type.'
                        },
                        {
                            field: 'blogId',
                            message: 'The "blogId" field must be of the string type.'
                        }
                    ]
                },
            );

            await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            console_log(res_POST_posts[0].body, res_POST_posts[0].status, 'Test 3: post(/posts)\n');
        });
        it('should not create a post if the data in the request body is incorrect.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: '   ',
                    shortDescription: '   ',
                    content: '   ',
                    blogId: '   '
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            expect(res_POST_posts[0].body).toEqual(
                {
                    errorsMessages: [
                        {
                            field: 'title',
                            message: 'The length of the "title" field should be from 1 to 30.'
                        },
                        {
                            field: 'shortDescription',
                            message: 'The length of the "shortDescription" field should be from 1 to 100.'
                        },
                        {
                            field: 'content',
                            message: 'The length of the "content" field should be from 1 to 1000.'
                        },
                        {
                            field: 'blogId',
                            message: 'A blog with such an ID does not exist.'
                        }
                    ]
                },
            );

            await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            console_log(res_POST_posts[0].body, res_POST_posts[0].status, 'Test 4: post(/posts)\n');
        });
        it('should not create a post if the data in the request body is incorrect.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: generateRandomString(31),
                    shortDescription: generateRandomString(101),
                    content: generateRandomString(1001),
                    blogId: generateRandomString(10)
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            expect(res_POST_posts[0].body).toEqual(
                {
                    errorsMessages: [
                        {
                            field: 'title',
                            message: 'The length of the "title" field should be from 1 to 30.'
                        },
                        {
                            field: 'shortDescription',
                            message: 'The length of the "shortDescription" field should be from 1 to 100.'
                        },
                        {
                            field: 'content',
                            message: 'The length of the "content" field should be from 1 to 1000.'
                        },
                        {
                            field: 'blogId',
                            message: 'A blog with such an ID does not exist.'
                        }
                    ]
                },
            );

            await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            console_log(res_POST_posts[0].body, res_POST_posts[0].status, 'Test 5: post(/posts)\n');
        });
        it('should not create a post if the data in the request body is incorrect.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: 123,
                    shortDescription: 123,
                    content: 123,
                    blogId: 123
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            expect(res_POST_posts[0].body).toEqual(
                {
                    errorsMessages: [
                        {
                            field: 'title',
                            message: 'The "title" field must be of the string type.'
                        },
                        {
                            field: 'shortDescription',
                            message: 'The "shortDescription" field must be of the string type.'
                        },
                        {
                            field: 'content',
                            message: 'The "content" field must be of the string type.'
                        },
                        {
                            field: 'blogId',
                            message: 'The "blogId" field must be of the string type.'
                        }
                    ]
                },
            );

            await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            console_log(res_POST_posts[0].body, res_POST_posts[0].status, 'Test 6: post(/posts)\n');
        });
    });
    describe('GET /posts', () => {
        it('should return an empty array.', async () => {
            const res_get = await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            console_log(res_get.body, res_get.status, 'Test 1: get(/posts)\n');
        });
        it('should return an array with a single post.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_GET_posts = await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_posts.body.items[0]).toEqual(res_POST_posts[0].body);
            expect(res_GET_posts.body.items.length).toEqual(1);

            console_log(res_GET_posts.body, res_GET_posts.status, 'Test 2: get(/posts)\n');
        });
        it('should return an array with a two posts.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                2,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_posts.length; i++) {
                expect(res_POST_posts[i].body).toEqual({
                    id: expect.any(String),
                    title: `${post.title}_${i + 1}`,
                    shortDescription: `${post.shortDescription}_${i + 1}`,
                    content: `${post.content}_${i + 1}`,
                    blogId: res_POST_blogs[0].body.id,
                    blogName: res_POST_blogs[0].body.name,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_GET_posts = await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_posts.body).toEqual({
                pageCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: postsTestManager.filterAndSort(
                    res_POST_posts.map(r => r.body)
                )
            })

            expect(res_GET_posts.body.items.length).toEqual(2);

            console_log(res_GET_posts.body, res_GET_posts.status, 'Test 3: get(/posts)\n');
        });
        it('should return post found by id.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_GET_post = await req
                .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_POST_posts[0].body).toEqual(res_GET_post.body);

            console_log(res_GET_post.body, res_GET_post.status, 'Test 4: get(/posts)\n');
        });
        it('should return error 404 not found.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_GET_post_1 = await req
                .get(`${SETTINGS.PATH.POSTS}/${new ObjectId()}`)
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const res_GET_post_2 = await req
                .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_post_2.body).toEqual(res_POST_posts[0].body);

            console_log(res_GET_post_1.body, res_GET_post_1.status, 'Test 5: get(/posts)\n');
        });
    });
    describe('PUT /posts', () => {
        it('should update post, the user is authenticated.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_UPDATE_post = await req
                .put(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send(
                    {
                        title: `${res_POST_posts[0].body.title}_UPDATE`,
                        shortDescription: `${res_POST_posts[0].body.shortDescription}_UPDATE`,
                        content: `${res_POST_posts[0].body.content}_UPDATE`,
                        blogId: res_POST_blogs[0].body.id
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            const res_GET_post = await req
                .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_post.body).toEqual(
                {
                    id: expect.any(String),
                    title: `${post.title}_1_UPDATE`,
                    shortDescription: `${post.shortDescription}_1_UPDATE`,
                    content: `${post.content}_1_UPDATE`,
                    blogId: res_POST_blogs[0].body.id,
                    blogName: res_POST_blogs[0].body.name,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                }
            )

            console_log(res_UPDATE_post.body, res_UPDATE_post.status, 'Test 1: put(/posts)\n');
        });
        it('should not update the post if the user has not been authenticated.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_UPDATE_post = await req
                .put(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .send(
                    {
                        title: `${res_POST_posts[0].body.title}_UPDATE`,
                        shortDescription: `${res_POST_posts[0].body.shortDescription}_UPDATE`,
                        content: `${res_POST_posts[0].body.content}_UPDATE`,
                        blogId: res_POST_blogs[0].body.id
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const res_GET_post = await req
                .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_post.body).toEqual(res_POST_posts[0].body);


            console_log(res_UPDATE_post.body, res_UPDATE_post.status, 'Test 2: put(/posts)\n');
        });
        it('should not update a post if the data in the request body is incorrect.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_UPDATE_post = await req
                .put(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({})
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            const res_GET_post = await req
                .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_post.body).toEqual(res_POST_posts[0].body);

            expect(res_UPDATE_post.body).toEqual({
                errorsMessages: [
                    {
                        field: 'title',
                        message: 'The "title" field must be of the string type.'
                    },
                    {
                        field: 'shortDescription',
                        message: 'The "shortDescription" field must be of the string type.'
                    },
                    {
                        field: 'content',
                        message: 'The "content" field must be of the string type.'
                    },
                    {
                        field: 'blogId',
                        message: 'The "blogId" field must be of the string type.'
                    }
                ]
            });

            console_log(res_UPDATE_post.body, res_UPDATE_post.status, 'Test 3: put(/posts)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_UPDATE_post = await req
                .put(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send(
                    {
                        title: '   ',
                        shortDescription: '   ',
                        content: '   ',
                        blogId: '   ',
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            const res_GET_post = await req
                .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_post.body).toEqual(res_POST_posts[0].body);

            expect(res_UPDATE_post.body).toEqual({
                errorsMessages: [
                    {
                        field: 'title',
                        message: 'The length of the "title" field should be from 1 to 30.'
                    },
                    {
                        field: 'shortDescription',
                        message: 'The length of the "shortDescription" field should be from 1 to 100.'
                    },
                    {
                        field: 'content',
                        message: 'The length of the "content" field should be from 1 to 1000.'
                    },
                    {
                        field: 'blogId',
                        message: 'A blog with such an ID does not exist.'
                    }
                ]
            });

            console_log(res_UPDATE_post.body, res_UPDATE_post.status, 'Test 4: put(/posts)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_UPDATE_post = await req
                .put(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send(
                    {
                        title: generateRandomString(31),
                        shortDescription: generateRandomString(101),
                        content: generateRandomString(1001),
                        blogId: generateRandomString(10),
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            const res_GET_post = await req
                .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_post.body).toEqual(res_POST_posts[0].body);

            expect(res_UPDATE_post.body).toEqual({
                errorsMessages: [
                    {
                        field: 'title',
                        message: 'The length of the "title" field should be from 1 to 30.'
                    },
                    {
                        field: 'shortDescription',
                        message: 'The length of the "shortDescription" field should be from 1 to 100.'
                    },
                    {
                        field: 'content',
                        message: 'The length of the "content" field should be from 1 to 1000.'
                    },
                    {
                        field: 'blogId',
                        message: 'A blog with such an ID does not exist.'
                    }
                ]
            });

            console_log(res_UPDATE_post.body, res_UPDATE_post.status, 'Test 5: put(/posts)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_UPDATE_post = await req
                .put(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send(
                    {
                        title: 123,
                        shortDescription: 123,
                        content: 123,
                        blogId: 123,
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            const res_GET_post = await req
                .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_post.body).toEqual(res_POST_posts[0].body);

            expect(res_UPDATE_post.body).toEqual({
                errorsMessages: [
                    {
                        field: 'title',
                        message: 'The "title" field must be of the string type.'
                    },
                    {
                        field: 'shortDescription',
                        message: 'The "shortDescription" field must be of the string type.'
                    },
                    {
                        field: 'content',
                        message: 'The "content" field must be of the string type.'
                    },
                    {
                        field: 'blogId',
                        message: 'The "blogId" field must be of the string type.'
                    }
                ]
            });

            console_log(res_UPDATE_post.body, res_UPDATE_post.status, 'Test 6: put(/posts)\n');
        });
    });
    describe('DELETE /posts', () => {
        it('should delete post, the user is authenticated.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_DELETE_post = await req
                .delete(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            console_log(res_DELETE_post.body, res_DELETE_post.status, 'Test 1: delete(/posts)\n');
        });
        it('should not delete blog, the user is not authenticated.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_DELETE_post = await req
                .delete(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const res_GET_post = await req
                .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_POST_posts[0].body).toEqual(res_GET_post.body)

            console_log(res_DELETE_post.body, res_DELETE_post.status, 'Test 2: delete(/posts)\n');
        });
        it('should return a 404 error if the blog was not found by the passed ID in the parameters.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_posts[0].body).toEqual({
                id: expect.any(String),
                title: `${post.title}_1`,
                shortDescription: `${post.shortDescription}_1`,
                content: `${post.content}_1`,
                blogId: res_POST_blogs[0].body.id,
                blogName: res_POST_blogs[0].body.name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_DALETE_post = await req
                .delete(`${SETTINGS.PATH.POSTS}/${new ObjectId()}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const res_GET_posts = await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_posts.body.items.length).toEqual(1)

            console_log(res_DALETE_post.body, res_DALETE_post.status, 'Test 3: delete(/posts)\n');
        });
    });
    describe('pagination /posts', () => {
        it('should use default pagination values when none are provided by the client.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_blogs.length; i++) {
                expect(res_POST_blogs[i].body).toEqual({
                    id: expect.any(String),
                    name: `${blog.name}_${i + 1}`,
                    description: `${blog.description}_${i + 1}`,
                    websiteUrl: blog.websiteUrl,
                    isMembership: blog.isMembership,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                11,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_posts.length; i++) {
                expect(res_POST_posts[i].body).toEqual({
                    id: expect.any(String),
                    title: `${post.title}_${i + 1}`,
                    shortDescription: `${post.shortDescription}_${i + 1}`,
                    content: `${post.content}_${i + 1}`,
                    blogId: res_POST_blogs[0].body.id,
                    blogName: res_POST_blogs[0].body.name,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_GET_posts = await req
                .get(SETTINGS.PATH.POSTS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_posts.body).toEqual({
                pageCount: 2,
                page: 1,
                pageSize: 10,
                totalCount: 11,
                items: postsTestManager.filterAndSort(
                    res_POST_posts.map(r => r.body)
                )
            })

            for (let i = 0; i < res_GET_posts.body.items.length; i++) {
                expect(res_GET_posts.body.items[i]).toEqual(
                    postsTestManager.filterAndSort(
                        res_POST_posts.map(r => r.body)
                    )[i]
                );
            }

            expect(res_GET_posts.body.items.length).toEqual(10);

            console_log(res_GET_posts.body, res_GET_posts.status, 'Test 1: pagination(/posts)\n');
        });
        it('should use client-provided pagination values to return the correct subset of data.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_blogs.length; i++) {
                expect(res_POST_blogs[i].body).toEqual({
                    id: expect.any(String),
                    name: `${blog.name}_${i + 1}`,
                    description: `${blog.description}_${i + 1}`,
                    websiteUrl: blog.websiteUrl,
                    isMembership: blog.isMembership,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                11,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_posts.length; i++) {
                expect(res_POST_posts[i].body).toEqual({
                    id: expect.any(String),
                    title: `${post.title}_${i + 1}`,
                    shortDescription: `${post.shortDescription}_${i + 1}`,
                    content: `${post.content}_${i + 1}`,
                    blogId: res_POST_blogs[0].body.id,
                    blogName: res_POST_blogs[0].body.name,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_GET_posts = await req
                .get(SETTINGS.PATH.POSTS)
                .query({
                    sortBy: 'title',
                    sortDirection: 'asc',
                    pageNumber: 2,
                    pageSize: 3
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_posts.body).toEqual({
                pageCount: 4,
                page: 2,
                pageSize: 3,
                totalCount: 11,
                items: postsTestManager.filterAndSort(
                    res_POST_posts.map(r => r.body),
                    'title',
                    'asc',
                    2,
                    3
                )
            })

            for (let i = 0; i < res_GET_posts.body.items.length; i++) {
                expect(res_GET_posts.body.items[i]).toEqual(
                    postsTestManager.filterAndSort(
                        res_POST_posts.map(r => r.body),
                        'title',
                        'asc',
                        2,
                        3
                    )[i]
                );
            }

            expect(res_GET_posts.body.items.length).toEqual(3);

            console_log(res_GET_posts.body, res_GET_posts.status, 'Test 2: pagination(/posts)\n');
        });
        it('should use client-provided pagination values to return the correct subset of data.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_blogs.length; i++) {
                expect(res_POST_blogs[i].body).toEqual({
                    id: expect.any(String),
                    name: `${blog.name}_${i + 1}`,
                    description: `${blog.description}_${i + 1}`,
                    websiteUrl: blog.websiteUrl,
                    isMembership: blog.isMembership,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                11,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_posts.length; i++) {
                expect(res_POST_posts[i].body).toEqual({
                    id: expect.any(String),
                    title: `${post.title}_${i + 1}`,
                    shortDescription: `${post.shortDescription}_${i + 1}`,
                    content: `${post.content}_${i + 1}`,
                    blogId: res_POST_blogs[0].body.id,
                    blogName: res_POST_blogs[0].body.name,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_GET_posts = await req
                .get(SETTINGS.PATH.POSTS)
                .query({
                    sortBy: 'id',
                    sortDirection: 'desc',
                    pageNumber: 6,
                    pageSize: 2
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_posts.body).toEqual({
                pageCount: 6,
                page: 6,
                pageSize: 2,
                totalCount: 11,
                items: postsTestManager.filterAndSort(
                    res_POST_posts.map(r => r.body),
                    'id',
                    'desc',
                    6,
                    2
                )
            })

            for (let i = 0; i < res_GET_posts.body.items.length; i++) {
                expect(res_GET_posts.body.items[i]).toEqual(
                    postsTestManager.filterAndSort(
                        res_POST_posts.map(r => r.body),
                        'id',
                        'desc',
                        6,
                        2
                    )[i]
                );
            }

            expect(res_GET_posts.body.items.length).toEqual(1);

            console_log(res_GET_posts.body, res_GET_posts.status, 'Test 3: pagination(/posts)\n');
        });
        it('should use client-provided pagination values to return the correct subset of data.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_blogs.length; i++) {
                expect(res_POST_blogs[i].body).toEqual({
                    id: expect.any(String),
                    name: `${blog.name}_${i + 1}`,
                    description: `${blog.description}_${i + 1}`,
                    websiteUrl: blog.websiteUrl,
                    isMembership: blog.isMembership,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                11,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_posts.length; i++) {
                expect(res_POST_posts[i].body).toEqual({
                    id: expect.any(String),
                    title: `${post.title}_${i + 1}`,
                    shortDescription: `${post.shortDescription}_${i + 1}`,
                    content: `${post.content}_${i + 1}`,
                    blogId: res_POST_blogs[0].body.id,
                    blogName: res_POST_blogs[0].body.name,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_GET_posts = await req
                .get(SETTINGS.PATH.POSTS)
                .query({
                    sortBy: 'shortDescription',
                    sortDirection: 'asc',
                    pageNumber: 6,
                    pageSize: 2
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_posts.body).toEqual({
                pageCount: 6,
                page: 6,
                pageSize: 2,
                totalCount: 11,
                items: postsTestManager.filterAndSort(
                    res_POST_posts.map(r => r.body),
                    'shortDescription',
                    'asc',
                    6,
                    2
                )
            })

            for (let i = 0; i < res_GET_posts.body.items.length; i++) {
                expect(res_GET_posts.body.items[i]).toEqual(
                    postsTestManager.filterAndSort(
                        res_POST_posts.map(r => r.body),
                        'shortDescription',
                        'asc',
                        6,
                        2
                    )[i]
                );
            }

            expect(res_GET_posts.body.items.length).toEqual(1);

            console_log(res_GET_posts.body, res_GET_posts.status, 'Test 4: pagination(/posts)\n');
        });
    });
    describe('GET /blogs/id/posts', () => {
        it('should return all posts from a specific blog.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                2,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_posts.length; i++) {
                expect(res_POST_posts[i].body).toEqual({
                    id: expect.any(String),
                    title: `${post.title}_${i + 1}`,
                    shortDescription: `${post.shortDescription}_${i + 1}`,
                    content: `${post.content}_${i + 1}`,
                    blogId: res_POST_blogs[0].body.id,
                    blogName: res_POST_blogs[0].body.name,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_GET_posts = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_POST_blogs[0].body.id}${SETTINGS.PATH.POSTS}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_posts.body).toEqual({
                pageCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: postsTestManager.filterAndSort(
                    res_POST_posts.map(r => r.body)
                )
            })

            expect(res_GET_posts.body.items.length).toEqual(2);

            console_log(res_GET_posts.body, res_GET_posts.status, 'Test 6: get(/blogs/id/posts)\n');
        });
        it('should return all entries from a specific blog using the pagination values provided by the client.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                11,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            for (let i = 0; i < res_POST_posts.length; i++) {
                expect(res_POST_posts[i].body).toEqual({
                    id: expect.any(String),
                    title: `${post.title}_${i + 1}`,
                    shortDescription: `${post.shortDescription}_${i + 1}`,
                    content: `${post.content}_${i + 1}`,
                    blogId: res_POST_blogs[0].body.id,
                    blogName: res_POST_blogs[0].body.name,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_GET_posts = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_POST_blogs[0].body.id}${SETTINGS.PATH.POSTS}`)
                .query({
                    sortBy: 'title',
                    sortDirection: 'asc',
                    pageNumber: 2,
                    pageSize: 3
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_GET_posts.body).toEqual({
                pageCount: 4,
                page: 2,
                pageSize: 3,
                totalCount: 11,
                items: postsTestManager.filterAndSort(
                    res_POST_posts.map(r => r.body),
                    'title',
                    'asc',
                    2,
                    3
                )
            })

            for (let i = 0; i < res_GET_posts.body.items.length; i++) {
                expect(res_GET_posts.body.items[i]).toEqual(
                    postsTestManager.filterAndSort(
                        res_POST_posts.map(r => r.body),
                        'title',
                        'asc',
                        2,
                        3
                    )[i]
                );
            }

            expect(res_GET_posts.body.items.length).toEqual(3);

            console_log(res_GET_posts.body, res_GET_posts.status, 'Test 7: get(/blogs/id/posts)\n');
        })
    });
    describe('POST /blogs/id/posts', () => {
        it('should create a post for a specific blog.', async () => {
            const res_POST_blogs: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_POST_blogs[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_posts: Response[] = await postsTestManager.createPost(
                11,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blogs[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );


            for (let i = 0; i < res_POST_posts.length; i++) {
                expect(res_POST_posts[i].body).toEqual({
                    id: expect.any(String),
                    title: `${post.title}_${i + 1}`,
                    shortDescription: `${post.shortDescription}_${i + 1}`,
                    content: `${post.content}_${i + 1}`,
                    blogId: res_POST_blogs[0].body.id,
                    blogName: res_POST_blogs[0].body.name,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            for (let i = 0; i < res_POST_posts.length; i++) {
                const res_GET_post = await req
                    .get(`${SETTINGS.PATH.POSTS}/${res_POST_posts[i].body.id}`)
                    .expect(SETTINGS.HTTP_STATUSES.OK_200);

                expect(res_POST_posts[i].body).toEqual(res_GET_post.body);
            }

            console_log(
                res_POST_posts.map(r => r.body),
                res_POST_posts[0].status,
                'Test 1: post(/blogs/:id/posts)\n'
            );
        });
    });
});
