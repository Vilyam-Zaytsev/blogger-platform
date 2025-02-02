import {console_log_e2e, encodingAdminDataInBase64, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    clearPresets,
    postContents,
    postShortDescriptions,
    postTitles,
    presets
} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/03_blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {blogsCollection, postsCollection, setBlogsCollection, setPostsCollection} from "../../src/db/mongoDb";
import {BlogDbType} from "../../src/03-blogs/types/blog-db-type";
import {PostDbType} from "../../src/04-posts/types/post-db-type";
import {postsTestManager} from "../helpers/managers/04_posts-test-manager";
import {Response} from "supertest";
import {PostViewModel} from "../../src/04-posts/types/input-output-types";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";

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

    describe('POST /posts', () => {

        it('should create a new post, the admin is authenticated.', async () => {

            await blogsTestManager
                .createBlog(1);

            const resCreatePost: Response = await req
                .post(SETTINGS.PATH.POSTS)
                .send({
                    title: postTitles[0],
                    shortDescription: postShortDescriptions[0],
                    content: postContents[0],
                    blogId: presets.blogs[0].id
                })
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    ))
                .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

            expect(resCreatePost.body).toEqual<PostViewModel>({
                id: expect.any(String),
                title: postTitles[0],
                shortDescription: postShortDescriptions[0],
                content: postContents[0],
                blogId: presets.blogs[0].id,
                blogName: presets.blogs[0].name,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

                const resGetPosts: Paginator<PostViewModel> = await postsTestManager
                    .getPosts();

                expect(resCreatePost.body).toEqual(resGetPosts.items[0]);
                expect(resGetPosts.items.length).toEqual(1);

            console_log_e2e(resCreatePost.body, resCreatePost.status, 'Test 1: post(/posts)');
        });

        it('should not create a post if the admin is not authenticated.', async () => {

            await blogsTestManager
                .createBlog(1);

            const resCreatePost: Response = await req
                .post(SETTINGS.PATH.POSTS)
                .send({
                    title: postTitles[0],
                    shortDescription: postShortDescriptions[0],
                    content: postContents[0],
                    blogId: presets.blogs[0].id
                })
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    ))
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const resGetPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(resGetPosts.items.length).toEqual(0);

            console_log_e2e(resCreatePost.body, resCreatePost.status, 'Test 2: post(/posts)');
        });

        it('should not create a post if the data in the request body is incorrect (an empty object is passed).', async () => {

            await blogsTestManager
                .createBlog(1);

            const resCreatePost: Response = await req
                .post(SETTINGS.PATH.POSTS)
                .send({})
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    ))
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resCreatePost.body).toEqual(
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

            const resGetPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(resGetPosts.items.length).toEqual(0);

            console_log_e2e(resCreatePost.body, resCreatePost.status, 'Test 3: post(/posts)');
        });

        it('should not create a post if the data in the request body is incorrect (title: empty line,  short Description: empty line, content: empty line, blogId: empty line).', async () => {

            await blogsTestManager
                .createBlog(1);

            const resCreatePost: Response = await req
                .post(SETTINGS.PATH.POSTS)
                .send({
                    title: '   ',
                    shortDescription: '   ',
                    content: '   ',
                    blogId: '   '
                })
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    ))
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resCreatePost.body).toEqual(
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

            const resGetPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(resGetPosts.items.length).toEqual(0);

            console_log_e2e(resCreatePost.body, resCreatePost.status, 'Test 4: post(/posts)');
        });

        it('should not create a post if the data in the request body is incorrect (title: exceeds max length, shortDescription: exceeds max length, content: exceeds max length, blogId: incorrect).', async () => {

            await blogsTestManager
                .createBlog(1);

            const resCreatePost: Response = await req
                .post(SETTINGS.PATH.POSTS)
                .send({
                    title: generateRandomString(31),
                    shortDescription: generateRandomString(101),
                    content: generateRandomString(1001),
                    blogId: generateRandomString(10)
                })
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    ))
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resCreatePost.body).toEqual(
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

            const resGetPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(resGetPosts.items.length).toEqual(0);

            console_log_e2e(resCreatePost.body, resCreatePost.status, 'Test 5: post(/posts)');
        });

        it('should not create a post if the data in the request body is incorrect (title: type number, shortDescription: type number, content: type number, blogId: incorrect).', async () => {

            await blogsTestManager
                .createBlog(1);

            const resCreatePost: Response = await req
                .post(SETTINGS.PATH.POSTS)
                .send({
                    title: 123,
                    shortDescription: 123,
                    content: 123,
                    blogId: 123
                })
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    ))
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resCreatePost.body).toEqual(
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

            const resGetPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(resGetPosts.items.length).toEqual(0);

            console_log_e2e(resCreatePost.body, resCreatePost.status, 'Test 6: post(/posts)');
        });
    });
