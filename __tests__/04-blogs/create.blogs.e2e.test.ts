import {Response} from "supertest";
import {console_log_e2e, encodingAdminDataInBase64, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {blog, blogDescriptions, blogNames, clearPresets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {MongoClient} from "mongodb";
import {BlogViewModel} from "../../src/04-blogs/types/input-output-types";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import mongoose from "mongoose";
import {runDb} from "../../src/db/mongo-db/mongoDb";

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
