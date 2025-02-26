import {Response} from "supertest";
import {
    console_log_e2e,
    encodingAdminDataInBase64,
    generateRandomString,
    req
} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    blog,
    blogDescriptions,
    blogNames
} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/03_blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {blogsCollection, setBlogsCollection} from "../../src/db/mongoDb";
import {BlogDbType} from "../../src/05-blogs/types/blog-db-type";
import {BlogViewModel} from "../../src/05-blogs/types/input-output-types";
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
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await blogsCollection.deleteMany({});
});

describe('POST /blogs', () => {

    it('should create a new blog, the admin is authenticated.', async () => {

        const resCreatedBlog: Response = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({
                name: blogNames[0],
                description: blogDescriptions[0],
                websiteUrl: `https://${blogNames[0].toLowerCase()}.com`
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

        expect(resCreatedBlog.body).toEqual<BlogViewModel>({
            id: expect.any(String),
            name: blogNames[0],
            description: blogDescriptions[0],
            websiteUrl: `https://${blogNames[0].toLowerCase()}.com`,
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            isMembership: expect.any(Boolean)
        });

        const foundBlog: BlogViewModel = await blogsTestManager
            .getBlog(resCreatedBlog.body.id);

        expect(resCreatedBlog.body).toEqual(foundBlog);

        console_log_e2e(resCreatedBlog.body, resCreatedBlog.status, 'Test 1: post(/blogs)');
    });

    it('should not create a blog if the admin is not authenticated.', async () => {

        const resCreatedBlog: Response = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({
                name: blogNames[0],
                description: blogDescriptions[0],
                websiteUrl: `https://${blogNames[0].toLowerCase()}.com`
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    'incorrect_login',
                    'incorrect_password'
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const foundBlogs: Paginator<BlogViewModel> = await blogsTestManager
            .getBlogs();

        expect(foundBlogs.items.length).toEqual(0);

        console_log_e2e(resCreatedBlog.body, resCreatedBlog.status, 'Test 2: post(/blogs)');
    });

    it('should not create a blog if the data in the request body is incorrect (an empty object is passed).', async () => {

        const resCreatedBlog: Response = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({})
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatedBlog.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'name',
                        message: 'The "name" field must be of the string type.'
                    },
                    {
                        field: 'description',
                        message: 'The "description" field must be of the string type.'
                    },
                    {
                        field: 'websiteUrl',
                        message: 'The "websiteUrl" field must be of the string type.'
                    }
                ]
            },
        );

        const foundBlogs: Paginator<BlogViewModel> = await blogsTestManager
            .getBlogs();

        expect(foundBlogs.items.length).toEqual(0);

        console_log_e2e(resCreatedBlog.body, resCreatedBlog.status, 'Test 3: post(/blogs)');
    });

    it('should not create a blog if the data in the request body is incorrect (name: empty line, description: empty line, website Url: empty line).', async () => {

        const resCreatedBlog: Response = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({
                name: '   ',
                description: '   ',
                websiteUrl: '   '
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatedBlog.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'name',
                        message: 'The length of the "name" field should be from 1 to 15.'
                    },
                    {
                        field: 'description',
                        message: 'The length of the "description" field should be from 1 to 500.'
                    },
                    {
                        field: 'websiteUrl',
                        message: 'The length of the "description" field should be from 1 to 100.'
                    }
                ]
            },
        );

        const foundBlogs: Paginator<BlogViewModel> = await blogsTestManager
            .getBlogs();

        expect(foundBlogs.items.length).toEqual(0);

        console_log_e2e(resCreatedBlog.body, resCreatedBlog.status, 'Test 4: post(/blogs)');
    });

    it('should not create a blog if the data in the request body is incorrect (name: exceeds max length, description: exceeds max length, website Url: exceeds max length).', async () => {

        const resCreatedBlog: Response = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({
                name: generateRandomString(16),
                description: generateRandomString(501),
                websiteUrl: generateRandomString(101)
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatedBlog.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'name',
                        message: 'The length of the "name" field should be from 1 to 15.'
                    },
                    {
                        field: 'description',
                        message: 'The length of the "description" field should be from 1 to 500.'
                    },
                    {
                        field: 'websiteUrl',
                        message: 'The length of the "description" field should be from 1 to 100.'
                    }
                ]
            },
        );

        const foundBlogs: Paginator<BlogViewModel> = await blogsTestManager
            .getBlogs();

        expect(foundBlogs.items.length).toEqual(0);

        console_log_e2e(resCreatedBlog.body, resCreatedBlog.status, 'Test 5: post(/blogs)');
    });

    it('should not create a blog if the data in the request body is incorrect (name: type number, description: type number, website Url: type number).', async () => {

        const resCreatedBlog: Response = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({
                name: 123,
                description: 123,
                websiteUrl: 123
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatedBlog.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'name',
                        message: 'The "name" field must be of the string type.'
                    },
                    {
                        field: 'description',
                        message: 'The "description" field must be of the string type.'
                    },
                    {
                        field: 'websiteUrl',
                        message: 'The "websiteUrl" field must be of the string type.'
                    }
                ]
            },
        );

        const foundBlogs: Paginator<BlogViewModel> = await blogsTestManager
            .getBlogs();

        expect(foundBlogs.items.length).toEqual(0);

        console_log_e2e(resCreatedBlog.body, resCreatedBlog.status, 'Test 6: post(/blogs)');
    });

    it('should not create a blog if the data in the request body is incorrect (invalid url).', async () => {

        const resCreatedBlog: Response = await req
            .post(SETTINGS.PATH.BLOGS)
            .send({
                name: blog.name,
                description: blog.description,
                websiteUrl: generateRandomString(10)
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resCreatedBlog.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'websiteUrl',
                        message: 'Invalid URL. The field must start with "https://" and match the pattern: "https://example.com/path".'
                    }
                ]
            },
        );

        const foundBlogs: Paginator<BlogViewModel> = await blogsTestManager
            .getBlogs();

        expect(foundBlogs.items.length).toEqual(0);

        console_log_e2e(resCreatedBlog.body, resCreatedBlog.status, 'Test 7: post(/blogs)');
    });
});
