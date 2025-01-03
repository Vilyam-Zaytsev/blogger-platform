import {Response} from "supertest";
import {
    console_log,
    encodingAdminDataInBase64,
    generateRandomString,
    req
} from './helpers/test-helpers';
import {SETTINGS} from "../src/settings";
import {blog} from "./helpers/datasets-for-tests";
import {blogsTestManager} from "./helpers/blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
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
            const res_post: Response[] = await blogsTestManager.createBlog(
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

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_post[0].body).toEqual(res_get.body);

            console_log(res_post[0].body, res_post[0].status, 'Test 1: post(/blogs)\n');
        });
        it('should not create a blog if the user is not authenticated.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    'incorrect_login',
                    'incorrect_password'
                ),
                SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401
            );

            await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            console_log(res_post[0].body, res_post[0].status, 'Test 2: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {},
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            expect(res_post[0].body).toEqual(
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

            console_log(res_post[0].body, res_post[0].status, 'Test 3: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
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
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            expect(res_post[0].body).toEqual(
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

            console_log(res_post[0].body, res_post[0].status, 'Test 4: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
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
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            expect(res_post[0].body).toEqual(
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

            console_log(res_post[0].body, res_post[0].status, 'Test 5: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
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
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            expect(res_post[0].body).toEqual(
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

            console_log(res_post[0].body, res_post[0].status, 'Test 6: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
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
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            expect(res_post[0].body).toEqual(
                {
                    errorsMessages: [
                        {
                            field: 'websiteUrl',
                            message: 'Invalid URL. The field must start with "https://" and match the pattern: "https://example.com/path".'
                        }
                    ]
                },
            )

            console_log(res_post[0].body, res_post[0].status, 'Test 7: post(/blogs)\n');
        });
    });
    describe('GET /blogs', () => {
        it('should return an empty array.', async () => {
            const res = await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200)

            expect(res.body).toEqual({
                "pageCount": 0,
                "page": 1,
                "pageSize": 10,
                "totalCount": 0,
                "items": []
            })

            console_log(res.body, res.status, 'Test 1: get(/blogs)\n');
        });
        it('should return an array with a single blog.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
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

            const res_get: Response = await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual({
                "pageCount": 1,
                "page": 1,
                "pageSize": 10,
                "totalCount": 1,
                "items": [{...res_post[0].body}]
            });
            expect(res_get.body.items[0]).toEqual(res_post[0].body);
            expect(res_get.body.items.length).toEqual(1);


            console_log(res_get.body, res_get.status, 'Test 2: get(/blogs)\n');
        });
        it('should return an array with a two blogs.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                2,
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

            const res_get: Response = await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual({
                "pageCount": 1,
                "page": 1,
                "pageSize": 10,
                "totalCount": res_post.length,
                "items": [...res_post.map(r => r.body)]
            });

            expect(res_get.body.items.length).toEqual(2);

            console_log(res_get.body, res_get.status, 'Test 3: get(/blogs)\n');
        });
        it('should return blog found by id.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
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
            const res_get: Response = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_post[0].body).toEqual(res_get.body);

            console_log(res_get.body, res_get.status, 'Test 4: get(/blogs)\n');
        });
        it('should return error 404 not found.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
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
            const res_get_1: Response = await req
                .get(`${SETTINGS.PATH.BLOGS}/${new ObjectId()}`)
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404, {});

            const res_get_2: Response = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_post[0].body).toEqual(res_get_2.body);

            console_log(res_get_1.body, res_get_1.status, 'Test 5: get(/blogs)\n');
        });
    });
    describe('PUT /blogs', () => {
        it('should update blog, the user is authenticated.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_put = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send(
                    {
                        name: `${res_post[0].body.name}_update`,
                        description: `${res_post[0].body.description}_update`,
                        websiteUrl: res_post[0].body.websiteUrl
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual(
                {
                    id: expect.any(String),
                    name: `${res_post[0].body.name}_update`,
                    description: `${res_post[0].body.description}_update`,
                    websiteUrl: res_post[0].body.websiteUrl,
                    isMembership: res_post[0].body.isMembership,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                }
            );

            console_log(res_put.body, res_put.status, 'Test 1: put(/blogs)\n');

        });
        it('should not update the blog if the user has not been authenticated.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_put = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .send(
                    {
                        name: `${res_post[0].body.name}_update`,
                        description: `${res_post[0].body.description}_update`,
                        websiteUrl: res_post[0].body.websiteUrl
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual(res_post[0].body);

            console_log(res_put.body, res_put.status, 'Test 2: put(/blogs)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_put = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({})
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(res_put.body).toEqual({
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

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual(res_post[0].body);

            console_log(res_put.body, res_put.status, 'Test 3: put(/blogs)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_put = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
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

            expect(res_put.body).toEqual(
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

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual(res_post[0].body);

            console_log(res_put.body, res_put.status, 'Test 4: put(/blogs)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_put = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
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

            expect(res_put.body).toEqual(
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

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual(res_post[0].body);

            console_log(res_put.body, res_put.status, 'Test 5: put(/blogs)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_put = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
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

            expect(res_put.body).toEqual(
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

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual(res_post[0].body);

            console_log(res_put.body, res_put.status, 'Test 6: put(/blogs)\n');
        });
        it('should not update a blog if the data in the request body is incorrect.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_put = await req
                .put(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({
                    name: `${res_post[0].body.name}_update`,
                    description: `${res_post[0].body.description}_update`,
                    websiteUrl: generateRandomString(10)
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(res_put.body).toEqual(
                {
                    errorsMessages: [
                        {
                            field: 'websiteUrl',
                            message: 'Invalid URL. The field must start with "https://" and match the pattern: "https://example.com/path".'
                        }
                    ]
                },
            );

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual(res_post[0].body);

            console_log(res_put.body, res_put.status, 'Test 7: put(/blogs)\n');
        });
    });
    describe('DELETE /blogs', () => {
        it('should delete blog, the user is authenticated.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual(res_post[0].body);

            const res_delete = await req
                .delete(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect({
                pageCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            });

            console_log(res_delete.body, res_delete.status, 'Test 1: delete(/blogs)\n');
        });
        it('should not delete blog, the user is not authenticated.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_delete = await req
                .delete(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_post[0].body).toEqual(res_get.body);

            console_log(res_delete.body, res_delete.status, 'Test 2: delete(/blogs)\n');
        });
        it('should return a 404 error if the blog was not found by the passed ID in the parameters.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                1,
                {
                    name: blog.name,
                    description: blog.description,
                    websiteUrl: blog.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
            );

            expect(res_post[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_delete = await req
                .delete(`${SETTINGS.PATH.BLOGS}/${new ObjectId()}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const res_get = await req
                .get(`${SETTINGS.PATH.BLOGS}/${res_post[0].body.id}`)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_post[0].body).toEqual(res_get.body);

            console_log(res_delete.body, res_delete.status, 'Test 3: delete(/blogs)\n');
        });
    });
    describe('pagination /blogs', () => {
        it('should use default pagination values when none are provided by the client.', async () => {
            const res_post: Response[] = await blogsTestManager.createBlog(
                11,
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

            for (let i = 0; i < res_post.length; i++) {
                expect(res_post[i].body).toEqual({
                    id: expect.any(String),
                    name: `${blog.name}_${i + 1}`,
                    description: `${blog.description}_${i + 1}`,
                    websiteUrl: blog.websiteUrl,
                    isMembership: blog.isMembership,
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                });
            }

            const res_get = await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual({
                "pageCount": 2,
                "page": 1,
                "pageSize": 10,
                "totalCount": 11,
                "items": blogsTestManager.filterAndSort(
                    res_post.map(r => r.body)
                )
            });

            for (let i = 0; i < res_get.body.items.length; i++) {
                expect(res_get.body.items[i]).toEqual(
                    blogsTestManager.filterAndSort(
                        res_post.map(r => r.body)
                    )[i]
                );
            }

            console_log(res_get.body, res_get.status, 'Test 1: pagination(/blogs)\n');
        })
    })
});
