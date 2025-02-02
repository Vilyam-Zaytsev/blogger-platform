import {Response} from "supertest";
import {
    console_log_e2e,
    encodingAdminDataInBase64,
    generateRandomString,
    req
} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {blogDescriptions, blogNames, clearPresets, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/03_blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {blogsCollection, setBlogsCollection} from "../../src/db/mongoDb";
import {BlogDbType} from "../../src/03-blogs/types/blog-db-type";
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

    describe('PUT /blogs', () => {

        it('should update blog, the admin is authenticated.', async () => {

            await blogsTestManager
                .createBlog(1);

            const resUpdateBlog: Response = await req
                .put(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send(
                    {
                        name: blogNames[1],
                        description: blogDescriptions[1],
                        websiteUrl: `https://${blogNames[1].toLowerCase()}.com`
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            const foundBlog: BlogViewModel = await blogsTestManager
                .getBlog(presets.blogs[0].id);

            expect(foundBlog).toEqual(
                {
                    id: expect.any(String),
                    name: blogNames[1],
                    description: blogDescriptions[1],
                    websiteUrl: `https://${blogNames[1].toLowerCase()}.com`,
                    isMembership: expect.any(Boolean),
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                }
            );

            console_log_e2e(resUpdateBlog.body, resUpdateBlog.status, 'Test 1: put(/blogs)');
        });

        it('should not update the blog if the user has not been authenticated.', async () => {

            await blogsTestManager
                .createBlog(1);

            const resUpdateBlog: Response = await req
                .put(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .send(
                    {
                        name: blogNames[1],
                        description: blogDescriptions[1],
                        websiteUrl: `https://${blogNames[1].toLowerCase()}.com`
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const foundBlog: BlogViewModel = await blogsTestManager
                .getBlog(presets.blogs[0].id);

            expect(foundBlog).toEqual(presets.blogs[0]);

            console_log_e2e(resUpdateBlog.body, resUpdateBlog.status, 'Test 2: put(/blogs)');
        });

        it('should not update a blog if the data in the request body is incorrect (an empty object is passed).', async () => {

            await blogsTestManager
                .createBlog(1);

            const resUpdateBlog: Response = await req
                .put(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({})
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resUpdateBlog.body).toEqual({
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
            });

            const foundBlog: BlogViewModel = await blogsTestManager
                .getBlog(presets.blogs[0].id);

            expect(foundBlog).toEqual(presets.blogs[0]);

            console_log_e2e(resUpdateBlog.body, resUpdateBlog.status, 'Test 3: put(/blogs)');
        });

        it('should not update a blog if the data in the request body is incorrect (name: empty line, description: empty line, website Url: empty line).', async () => {

            await blogsTestManager
                .createBlog(1);

            const resUpdateBlog: Response = await req
                .put(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({
                    name: '   ',
                    description: '   ',
                    websiteUrl: '   '
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resUpdateBlog.body).toEqual(
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

            const foundBlog: BlogViewModel = await blogsTestManager
                .getBlog(presets.blogs[0].id);

            expect(foundBlog).toEqual(presets.blogs[0]);

            console_log_e2e(resUpdateBlog.body, resUpdateBlog.status, 'Test 4: put(/blogs)');
        });

        it('should not update a blog if the data in the request body is incorrect (name: exceeds max length, description: exceeds max length, website Url: exceeds max length).', async () => {

            await blogsTestManager
                .createBlog(1);

            const resUpdateBlog: Response = await req
                .put(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({
                    name: generateRandomString(16),
                    description: generateRandomString(501),
                    websiteUrl: generateRandomString(101)
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resUpdateBlog.body).toEqual(
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

            const foundBlog: BlogViewModel = await blogsTestManager
                .getBlog(presets.blogs[0].id);

            expect(foundBlog).toEqual(presets.blogs[0]);

            console_log_e2e(resUpdateBlog.body, resUpdateBlog.status, 'Test 5: put(/blogs)');
        });

        it('should not update a blog if the data in the request body is incorrect (name: type number, description: type number, website Url: type number).', async () => {

            await blogsTestManager
                .createBlog(1);

            const resUpdateBlog: Response = await req
                .put(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({
                    name: 123,
                    description: 123,
                    websiteUrl: 123
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resUpdateBlog.body).toEqual(
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

            const foundBlog: BlogViewModel = await blogsTestManager
                .getBlog(presets.blogs[0].id);

            expect(foundBlog).toEqual(presets.blogs[0]);

            console_log_e2e(resUpdateBlog.body, resUpdateBlog.status, 'Test 6: put(/blogs)');
        });

        it('should not update a blog if the data in the request body is incorrect (invalid url).', async () => {

            await blogsTestManager
                .createBlog(1);

            const resUpdateBlog: Response = await req
                .put(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({
                    name: blogNames[1],
                    description: blogDescriptions[1],
                    websiteUrl: generateRandomString(10)
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resUpdateBlog.body).toEqual(
                {
                    errorsMessages: [
                        {
                            field: 'websiteUrl',
                            message: 'Invalid URL. The field must start with "https://" and match the pattern: "https://example.com/path".'
                        }
                    ]
                },
            );

            const foundBlog: BlogViewModel = await blogsTestManager
                .getBlog(presets.blogs[0].id);

            expect(foundBlog).toEqual(presets.blogs[0]);

            console_log_e2e(resUpdateBlog.body, resUpdateBlog.status, 'Test 7: put(/blogs)');
        });
    });
