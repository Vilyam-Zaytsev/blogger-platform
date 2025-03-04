import {Response} from "supertest";
import {
    console_log_e2e,
    encodingAdminDataInBase64,
    generateRandomString,
    req
} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    clearPresets,
    postContents,
    postShortDescriptions,
    postTitles,
    presets
} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {blogsCollection, postsCollection, setBlogsCollection, setPostsCollection} from "../../src/db/mongoDb";
import {BlogDbType} from "../../src/05-blogs/types/blog-db-type";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {PostViewModel} from "../../src/06-posts/types/input-output-types";
import {PostDbType} from "../../src/06-posts/types/post-db-type";

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

describe('POST /blogs/{blogId}/posts', () => {

    it('should create a new post, the admin is authenticated.', async () => {

         await blogsTestManager
             .createBlog(1);

        const resCreatePosts: Response = await req
            .post(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}${SETTINGS.PATH.POSTS}`)
            .send({
                title: postTitles[0],
                shortDescription: postShortDescriptions[0],
                content: postContents[0]
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ))
            .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

        expect(resCreatePosts.body).toEqual<PostViewModel>({
            id: expect.any(String),
            title: postTitles[0],
            shortDescription: postShortDescriptions[0],
            content: postContents[0],
            blogId: presets.blogs[0].id,
            blogName: presets.blogs[0].name,
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        });

        const foundPosts: Paginator<PostViewModel> = await postsTestManager
            .getPosts();

        expect(foundPosts.items[0]).toEqual<PostViewModel>(resCreatePosts.body);
        expect(foundPosts.items.length).toEqual(1);


        console_log_e2e(resCreatePosts.body, resCreatePosts.status, 'Test 1: post(/blogs/{blogId}/posts)');
    });

    it('should not create a post if the admin is not authenticated.', async () => {

        await blogsTestManager
            .createBlog(1);

        const resCreatePosts: Response = await req
            .post(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}${SETTINGS.PATH.POSTS}`)
            .send({
                title: postTitles[0],
                shortDescription: postShortDescriptions[0],
                content: postContents[0]
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    'incorrect_login',
                    'incorrect_password'
                ))
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const foundPosts: Paginator<PostViewModel> = await postsTestManager
            .getPosts();

        expect(foundPosts.items.length).toEqual(0);

        console_log_e2e(resCreatePosts.body, resCreatePosts.status, 'Test 2: post(/blogs/{blogId}/posts)');
    });

    it('should not create a post if the data in the request body is incorrect (an empty object is passed).', async () => {

        await blogsTestManager
            .createBlog(1);

        const resCreatePosts: Response = await req
            .post(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}${SETTINGS.PATH.POSTS}`)
            .send({})
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ))
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatePosts.body).toEqual(
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
                ]
            },
        );

        const foundPosts: Paginator<PostViewModel> = await postsTestManager
            .getPosts();

        expect(foundPosts.items.length).toEqual(0);

        console_log_e2e(resCreatePosts.body, resCreatePosts.status, 'Test 3: post(/blogs/{blogId}/posts)');
    });

    it('should not create a post if the data in the request body is incorrect (title: empty line, shortDescription: empty line, content: empty line).', async () => {

        await blogsTestManager
            .createBlog(1);

        const resCreatePosts: Response = await req
            .post(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}${SETTINGS.PATH.POSTS}`)
            .send({
                title: '   ',
                shortDescription: '   ',
                content: '   '
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ))
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatePosts.body).toEqual(
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
                    }
                ]
            },
        );

        const foundPosts: Paginator<PostViewModel> = await postsTestManager
            .getPosts();

        expect(foundPosts.items.length).toEqual(0);

        console_log_e2e(resCreatePosts.body, resCreatePosts.status, 'Test 4: post(/blogs/{blogId}/posts)');
    });

    it('should not create a post if the data in the request body is incorrect (title: exceeds max length, shortDescription: exceeds max length, content: exceeds max length).', async () => {

        await blogsTestManager
            .createBlog(1);

        const resCreatePosts: Response = await req
            .post(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}${SETTINGS.PATH.POSTS}`)
            .send({
                title: generateRandomString(31),
                shortDescription: generateRandomString(101),
                content: generateRandomString(1001),
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ))
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatePosts.body).toEqual(
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
                    }
                ]
            },
        );

        const foundPosts: Paginator<PostViewModel> = await postsTestManager
            .getPosts();

        expect(foundPosts.items.length).toEqual(0);

        console_log_e2e(resCreatePosts.body, resCreatePosts.status, 'Test 5: post(/blogs/{blogId}/posts)');
    });

    it('should not create a post if the data in the request body is incorrect (title: type number, shortDescription: type number, content: type number).', async () => {

        await blogsTestManager
            .createBlog(1);

        const resCreatePosts: Response = await req
            .post(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}${SETTINGS.PATH.POSTS}`)
            .send({
                title: 123,
                shortDescription: 123,
                content: 123
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ))
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatePosts.body).toEqual(
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
                    }
                ]
            },
        );

        const foundPosts: Paginator<PostViewModel> = await postsTestManager
            .getPosts();

        expect(foundPosts.items.length).toEqual(0);

        console_log_e2e(resCreatePosts.body, resCreatePosts.status, 'Test 6: post(/blogs/{blogId}/posts)');
    });

    it('should not create a post if the data in the request body is incorrect (blogId: incorrect).', async () => {

        await blogsTestManager
            .createBlog(1);

        const resCreatePosts: Response = await req
            .post(`${SETTINGS.PATH.BLOGS}/${new ObjectId()}${SETTINGS.PATH.POSTS}`)
            .send({
                title: postTitles[0],
                shortDescription: postShortDescriptions[0],
                content: postContents[0]
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ))
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const foundPosts: Paginator<PostViewModel> = await postsTestManager
            .getPosts();

        expect(foundPosts.items.length).toEqual(0);

        console_log_e2e(resCreatePosts.body, resCreatePosts.status, 'Test 7: post(/blogs/{blogId}/posts)');
    });
});