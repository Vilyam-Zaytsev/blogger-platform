import {console_log, encodingAdminDataInBase64, generateRandomString, req} from './helpers/test-helpers';
import {SETTINGS} from "../src/settings";
import {blog_1, blog_2} from "./helpers/datasets-for-tests";
import {blogsTestManager} from "./helpers/blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {blogsCollection, setBlogsCollection} from "../src/db/mongoDb";
import {BlogDbType} from "../src/types/db-types/blog-db-type";

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


describe('/blogs', () => {
    describe('POST /blogs', () => {
        it('should create a new blog, the user is authenticated.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_1.body).toEqual(res_2.body);

            console_log(res_1.body, res_1.status, 'Test 1: post(/blogs)\n');
        });
        it('should not create a blog if the user is not authenticated.', async () => {
            const res = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                'incorrect-adminData',
                SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401
            );

            await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200, []);

            console_log(res.body, res.status, 'Test 2: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            const res = await blogsTestManager.createBlog(
                {},
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200, []);

            expect(res.body).toEqual(
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
            )

            console_log(res.body, res.status, 'Test 3: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            const res = await blogsTestManager.createBlog(
                {
                    name: '   ',
                    description: '   ',
                    websiteUrl: '   '
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200, []);

            expect(res.body).toEqual(
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
            )

            console_log(res.body, res.status, 'Test 4: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            const res = await blogsTestManager.createBlog(
                {
                    name: generateRandomString(16),
                    description: generateRandomString(501),
                    websiteUrl: generateRandomString(101)
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200, []);

            expect(res.body).toEqual(
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
            )

            console_log(res.body, res.status, 'Test 5: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            const res = await blogsTestManager.createBlog(
                {
                    name: 123,
                    description: 123,
                    websiteUrl: 123
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200, []);

            expect(res.body).toEqual(
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
            )

            console_log(res.body, res.status, 'Test 6: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            const res = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: generateRandomString(10)
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200, []);

            expect(res.body).toEqual(
                {
                    errorsMessages: [
                        {
                            field: 'websiteUrl',
                            message: 'Invalid URL. The field must start with "https://" and match the pattern: "https://example.com/path".'
                        }
                    ]
                },
            )

            console_log(res.body, res.status, 'Test 7: post(/blogs)\n');
        });
    });
    describe('GET /blogs', () => {
        it('should return an empty array.', async () => {
            const res = await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200, [])

            console_log(res.body, res.status, 'Test 1: get(/blogs)\n');
        });
        it('should return an array with a single blog.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            const res_2 = await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_2.body[0]).toEqual(res_1.body);
            expect(res_2.body.length).toEqual(1);


            console_log(res_2.body, res_2.status, 'Test 2: get(/blogs)\n');
        });
        it('should return an array with a two blogs.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );
            const res_2 = await blogsTestManager.createBlog(
                {
                    name: blog_2.name,
                    description: blog_2.description,
                    websiteUrl: blog_2.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            const res_3 = await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_3.body[0]).toEqual(res_1.body);
            expect(res_3.body[1]).toEqual(res_2.body);
            expect(res_3.body.length).toEqual(2);

            console_log(res_3.body, res_3.status, 'Test 3: get(/blogs)\n');
        });
        it('should return blog found by id.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );
            const res_2 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_1.body).toEqual(res_2.body);

            console_log(res_2.body, res_2.status, 'Test 4: get(/blogs)\n');
        });
        it('should return error 404 not found.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );
            const res_2 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${(res_1.body.id + 1)}`)
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const res_3 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_1.body).toEqual(res_3.body);

            console_log(res_2.body, res_2.status, 'Test 5: get(/blogs)\n');
        });
    });
    describe('PUT /blogs', () => {
        it('should update blog, the user is authenticated.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send(
                    {
                        name: blog_2.name,
                        description: blog_2.description,
                        websiteUrl: blog_2.websiteUrl
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            const res_3 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_3.body).toEqual(
                {
                    id: expect.any(String),
                    name: blog_2.name,
                    description: blog_2.description,
                    websiteUrl: blog_2.websiteUrl,
                    isMembership: blog_2.isMembership,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                }
            );

            console_log(res_2.body, res_2.status, 'Test 1: post(/blogs)\n');

        });
        it('should not update the blog if the user has not been authenticated.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .send(
                    {
                        name: blog_2.name,
                        description: blog_2.description,
                        websiteUrl: blog_2.websiteUrl
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const res_3 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_3.body).toEqual(res_1.body);

            console_log(res_2.body, res_2.status, 'Test 2: post(/blogs)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({})
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(res_2.body).toEqual({
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

            const res_3 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_3.body).toEqual(res_1.body);

            console_log(res_2.body, res_2.status, 'Test 3: post(/blogs)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
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

            expect(res_2.body).toEqual(
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

            const res_3 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_3.body).toEqual(res_1.body);

            console_log(res_2.body, res_2.status, 'Test 4: post(/blogs)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
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

            expect(res_2.body).toEqual(
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

            const res_3 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_3.body).toEqual(res_1.body);

            console_log(res_2.body, res_2.status, 'Test 5: post(/blogs)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
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

            expect(res_2.body).toEqual(
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

            const res_3 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_3.body).toEqual(res_1.body);

            console_log(res_2.body, res_2.status, 'Test 6: post(/blogs)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({
                    name: blog_2.name,
                    description: blog_2.description,
                    websiteUrl: generateRandomString(10)
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(res_2.body).toEqual(
                {
                    errorsMessages: [
                        {
                            field: 'websiteUrl',
                            message: 'Invalid URL. The field must start with "https://" and match the pattern: "https://example.com/path".'
                        }
                    ]
                },
            );

            const res_3 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_3.body).toEqual(res_1.body);

            console_log(res_2.body, res_2.status, 'Test 7: post(/blogs)\n');
        });
    });
    describe('DELETE /blogs', () => {
        it('should delete blog, the user is authenticated.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .delete(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200, []);

            console_log(res_2.body, res_2.status, 'Test 1: post(/blogs)\n');
        });
        it('should not delete blog, the user is not authenticated.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .delete(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const res_3 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_1.body).toEqual(res_3.body);

            console_log(res_2.body, res_2.status, 'Test 2: post(/blogs)\n');
        });
        it('should return a 404 error if the blog was not found by the passed ID in the parameters.', async () => {
            const res_1 = await blogsTestManager.createBlog(
                {
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_1.body).toEqual({
                id: expect.any(String),
                name: blog_1.name,
                description: blog_1.description,
                websiteUrl: blog_1.websiteUrl,
                isMembership: blog_1.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_2 = await req
                .delete(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}1`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const res_3 = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_1.body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_1.body).toEqual(res_3.body);

            console_log(res_2.body, res_2.status, 'Test 3: post(/blogs)\n');
        });
    });
});
