import {clearDb, console_log, encodingAdminDataInBase64, generateRandomString, req} from './helpers/test-helpers';
import {SETTINGS} from "../src/settings";
import {blog_one} from "./helpers/datasets-for-tests";
import {db} from "../src/db/db";
import {blogsTestManager} from "./helpers/blogs-test-manager";

describe('/blogs', () => {
    describe('POST /blogs', () => {
        it('should create a new blog, the user is authenticated.', async () => {
            const res = await blogsTestManager.createBlog(
                {
                    name: blog_one.name,
                    description: blog_one.description,
                    websiteUrl: blog_one.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )

            expect(res.body).toEqual({
                id: expect.any(String),
                name: blog_one.name,
                description: blog_one.description,
                websiteUrl: blog_one.websiteUrl
            });

            expect(res.body).toEqual(db.blogs[0]);

            console_log(res.body, res.status, 'Test 1: post(/blogs)\n');
        });
        it('should not create a blog if the user is not authenticated.', async () => {
            clearDb();

            const res = await blogsTestManager.createBlog(
                {
                    name: blog_one.name,
                    description: blog_one.description,
                    websiteUrl: blog_one.websiteUrl
                },
                'incorect-adminData',
                SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401
            );

            expect(db.blogs.length).toEqual(0);

            console_log(res.body, res.status, 'Test 2: post(/blogs)\n');
        });
        it('should not create a blog if the data in the request body is incorrect.', async () => {
            clearDb();

            const res = await blogsTestManager.createBlog(
                {},
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            expect(db.blogs.length).toEqual(0);
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
            clearDb();

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

            expect(db.blogs.length).toEqual(0);
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
            clearDb();

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

            expect(db.blogs.length).toEqual(0);
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
            clearDb();

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

            expect(db.blogs.length).toEqual(0);
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
            clearDb();

            const res = await blogsTestManager.createBlog(
                {
                    name: blog_one.name,
                    description: blog_one.description,
                    websiteUrl: generateRandomString(10)
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            expect(db.blogs.length).toEqual(0);
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
        it('should create a new blog, the user is authenticated.', async () => {
            const res = await blogsTestManager.createBlog(
                {
                    name: blog_one.name,
                    description: blog_one.description,
                    websiteUrl: blog_one.websiteUrl
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )

            expect(res.body).toEqual({
                id: expect.any(String),
                name: blog_one.name,
                description: blog_one.description,
                websiteUrl: blog_one.websiteUrl
            });

            expect(res.body).toEqual(db.blogs[0]);

            console_log(res.body, res.status, 'Test 1: post(/blogs)\n');
        });
    })


});
