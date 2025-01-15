import {Response} from "supertest";
import {
    console_log,
    encodingAdminDataInBase64,
    generateRandomString,
    req
} from './helpers/test-helpers';
import {SETTINGS} from "../src/common/settings";
import {blog} from "./helpers/datasets-for-tests";
import {blogsTestManager} from "./helpers/blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {blogsCollection, setBlogsCollection} from "../src/db/mongoDb";
import {BlogDbType} from "../src/03-blogs/types/blog-db-type";

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

            console_log(res_post[0].body, res_post[0].status, 'Test 1: post(/blogs)');
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

            console_log(res_post[0].body, res_post[0].status, 'Test 2: post(/blogs)');
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

            console_log(res_post[0].body, res_post[0].status, 'Test 3: post(/blogs)');
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

            console_log(res_post[0].body, res_post[0].status, 'Test 4: post(/blogs)');
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

            console_log(res_post[0].body, res_post[0].status, 'Test 5: post(/blogs)');
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

            console_log(res_post[0].body, res_post[0].status, 'Test 6: post(/blogs)');
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

            console_log(res_post[0].body, res_post[0].status, 'Test 7: post(/blogs)');
        });
    });
    describe('GET /blogs', () => {
        it('should return an empty array.', async () => {
            const res = await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(SETTINGS.HTTP_STATUSES.OK_200)

            expect(res.body).toEqual({
                "pagesCount": 0,
                "page": 1,
                "pageSize": 10,
                "totalCount": 0,
                "items": []
            })

            console_log(res.body, res.status, 'Test 1: get(/blogs)');
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
                "pagesCount": 1,
                "page": 1,
                "pageSize": 10,
                "totalCount": 1,
                "items": [{...res_post[0].body}]
            });
            expect(res_get.body.items[0]).toEqual(res_post[0].body);
            expect(res_get.body.items.length).toEqual(1);


            console_log(res_get.body, res_get.status, 'Test 2: get(/blogs)');
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
                "pagesCount": 1,
                "page": 1,
                "pageSize": 10,
                "totalCount": res_post.length,
                "items": blogsTestManager.filterAndSort(
                    res_post.map(r => r.body)
                )
            });

            expect(res_get.body.items.length).toEqual(2);

            console_log(res_get.body, res_get.status, 'Test 3: get(/blogs)');
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

            console_log(res_get.body, res_get.status, 'Test 4: get(/blogs)');
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

            console_log(res_get_1.body, res_get_1.status, 'Test 5: get(/blogs)');
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

            console_log(res_put.body, res_put.status, 'Test 1: put(/blogs)');

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

            console_log(res_put.body, res_put.status, 'Test 2: put(/blogs)');
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

            console_log(res_put.body, res_put.status, 'Test 3: put(/blogs)');
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

            console_log(res_put.body, res_put.status, 'Test 4: put(/blogs)');
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

            console_log(res_put.body, res_put.status, 'Test 5: put(/blogs)');
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

            console_log(res_put.body, res_put.status, 'Test 6: put(/blogs)');
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

            console_log(res_put.body, res_put.status, 'Test 7: put(/blogs)');
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

            console_log(res_delete.body, res_delete.status, 'Test 1: delete(/blogs)');
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

            console_log(res_delete.body, res_delete.status, 'Test 2: delete(/blogs)');
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

            console_log(res_delete.body, res_delete.status, 'Test 3: delete(/blogs)');
        });
    });
    describe('pagination, sort, search in term /blogs', () => {
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
                "pagesCount": 2,
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

            expect(res_get.body.items.length).toEqual(10);

            console_log(res_get.body, res_get.status, 'Test 1: pagination(/blogs)');
        });
        it('should use client-provided pagination values to return the correct subset of data.', async () => {
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
                .query({
                    sortBy: 'name',
                    sortDirection: 'asc',
                    pageNumber: 2,
                    pageSize: 3
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual({
                pagesCount: 4,
                page: 2,
                pageSize: 3,
                totalCount: 11,
                items: blogsTestManager.filterAndSort(
                    res_post.map(r => r.body),
                    'name',
                    'asc',
                    2,
                    3
                )
            });

            for (let i = 0; i < res_get.body.items.length; i++) {
                expect(res_get.body.items[i]).toEqual(
                    blogsTestManager.filterAndSort(
                        res_post.map(r => r.body),
                        'name',
                        'asc',
                        2,
                        3
                    )[i]
                );
            }

            expect(res_get.body.items.length).toEqual(3);

            console_log(res_get.body, res_get.status, 'Test 2: pagination(/blogs)');
        });
        it('should use client-provided pagination values to return the correct subset of data.', async () => {
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
                .query({
                    sortBy: 'description',
                    sortDirection: 'desc',
                    pageNumber: 6,
                    pageSize: 2
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual({
                pagesCount: 6,
                page: 6,
                pageSize: 2,
                totalCount: 11,
                items: blogsTestManager.filterAndSort(
                    res_post.map(r => r.body),
                    'description',
                    'desc',
                    6,
                    2
                )
            });

            for (let i = 0; i < res_get.body.items.length; i++) {
                expect(res_get.body.items[i]).toEqual(
                    blogsTestManager.filterAndSort(
                        res_post.map(r => r.body),
                        'description',
                        'desc',
                        6,
                        2
                    )[i]
                );
            }

            expect(res_get.body.items.length).toEqual(1);

            console_log(res_get.body, res_get.status, 'Test 3: pagination(/blogs)');
        });
        it('should use client-provided pagination values to return the correct subset of data.', async () => {
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
                .query({
                    searchNameTerm: 'G_1',
                    sortBy: 'description',
                    sortDirection: 'asc',
                    pageNumber: 1,
                    pageSize: 2
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res_get.body).toEqual({
                pagesCount: 2,
                page: 1,
                pageSize: 2,
                totalCount: 3,
                items: blogsTestManager.filterAndSort(
                    res_post.map(r => r.body),
                    'description',
                    'asc',
                    1,
                    2,
                    'G_1'
                )
            });

            for (let i = 0; i < res_get.body.items.length; i++) {
                expect(res_get.body.items[i]).toEqual(
                    blogsTestManager.filterAndSort(
                        res_post.map(r => r.body),
                        'description',
                        'asc',
                        1,
                        2,
                        'G_1'
                    )[i]
                );
            }

            expect(res_get.body.items.length).toEqual(2);

            console_log(res_get.body, res_get.status, 'Test 4: pagination(/blogs)');
        });
    });
});
