import {console_log, generateRandomString, req} from './helpers/test-helpers';
import {SETTINGS} from "../src/settings";
import {blog_one} from "./helpers/datasets-for-tests";
import {db} from "../src/db/db";
import {blogsTestManager} from "./helpers/blogs-test-manager";

describe('/blogs', () => {
    // it('should get empty array', async () => {
    //     const res = await req
    //         .get(SETTINGS.PATH.BLOGS)
    //         .expect(200, [])
    //
    //     console_log(res.body, res.status, 'Test 1: get(/blogs)\n');
    // });
    // it('should find a blog by ID', async () => {
    //     const res1 = await req
    //         .post(SETTINGS.PATH.BLOGS)
    //         .send(blog1)
    //         .expect(201);
    //
    //     const res2 = await req
    //         .get(`${SETTINGS.PATH.BLOGS}/${res1.body.id}`)
    //         .expect(200);
    //
    //     expect(res2.body).toEqual({
    //         id: expect.any(String),
    //         name: blog1.name,
    //         description: blog1.description,
    //         websiteUrl: blog1.websiteUrl
    //     });
    //
    //     expect(res2.body).toEqual(db.blogs[0]);
    //
    //     console_log(res2.body, res2.status, 'Test 2: get(/blogs/id)\n');
    // });
    it('should create a new blog if the correct data is passed in the request body', async () => {
        const res = await blogsTestManager.createBlog({
            name: blog_one.name,
            description: blog_one.description,
            websiteUrl: blog_one.websiteUrl
        });

        expect(res.body).toEqual({
            id: expect.any(String),
            name: blog_one.name,
            description: blog_one.description,
            websiteUrl: blog_one.websiteUrl
        });

        expect(res.body).toEqual(db.blogs[0]);

        console_log(res.body, res.status, 'Test 1: post(/blogs)\n');
    });
    it('should not create a new blog if incorrect data is specified in the request body (the "name" undefined field)', async () => {
        const res = await blogsTestManager.createBlog(
            {
                name: undefined,
                description: blog_one.description,
                websiteUrl: blog_one.websiteUrl
            },
            SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        );

        expect(res.body).toEqual({
            'errorsMessages': [
                {
                    'field': 'name',
                    'message': 'The "name" field must be of the string type.',
                }
            ]

        });

        console_log(res.body, res.status, 'Test 2: post(/blogs)\n');
    });
    it('should not create a new blog if incorrect data is specified in the request body (the "name" field is not a string type).', async () => {
        const res = await blogsTestManager.createBlog(
            {
                name: 123,
                description: blog_one.description,
                websiteUrl: blog_one.websiteUrl
            },
            SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        );

        expect(res.body).toEqual({
            'errorsMessages': [
                {
                    'field': 'name',
                    'message': 'The "name" field must be of the string type.',
                }
            ]

        });

        console_log(res.body, res.status, 'Test 3: post(/blogs)\n');
    });
    it('should not create a new blog if incorrect data is specified in the request body (the "name" field is an empty line).', async () => {
        const res = await blogsTestManager.createBlog(
            {
                name: '   ',
                description: blog_one.description,
                websiteUrl: blog_one.websiteUrl
            },
            SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        );

        expect(res.body).toEqual({
            'errorsMessages': [
                {
                    'field': 'name',
                    'message': 'The length of the "name" field should be from 1 to 15.',
                }
            ]

        });

        console_log(res.body, res.status, 'Test 4: post(/blogs)\n');
    });
    it('should not create a new blog if incorrect data is specified in the request body (the "name" field consists of more than 15 characters).', async () => {
        const res = await blogsTestManager.createBlog(
            {
                name: generateRandomString(16),
                description: blog_one.description,
                websiteUrl: blog_one.websiteUrl
            },
            SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        );

        expect(res.body).toEqual({
            'errorsMessages': [
                {
                    'field': 'name',
                    'message': 'The length of the "name" field should be from 1 to 15.',
                }
            ]

        });

        console_log(res.body, res.status, 'Test 5: post(/blogs)\n');
    });
    it('should not create a new blog if incorrect data is specified in the request body (the "description" undefined field).', async () => {
        const res = await blogsTestManager.createBlog(
            {
                name: blog_one.name,
                description: undefined,
                websiteUrl: blog_one.websiteUrl
            },
            SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        );

        expect(res.body).toEqual({
            'errorsMessages': [
                {
                    'field': 'description',
                    'message': 'The "description" field must be of the string type.',
                }
            ]

        });

        console_log(res.body, res.status, 'Test 6: post(/blogs)\n');
    });
    it('should not create a new blog if incorrect data is specified in the request body (the "description" field is not a string type).', async () => {
        const res = await blogsTestManager.createBlog(
            {
                name: blog_one.name,
                description: 123,
                websiteUrl: blog_one.websiteUrl
            },
            SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        );

        expect(res.body).toEqual({
            'errorsMessages': [
                {
                    'field': 'description',
                    'message': 'The "description" field must be of the string type.',
                }
            ]

        });

        console_log(res.body, res.status, 'Test 7: post(/blogs)\n');
    });
    it('should not create a new blog if incorrect data is specified in the request body (the "description" field is an empty line).', async () => {
        const res = await blogsTestManager.createBlog(
            {
                name: blog_one.name,
                description: '   ',
                websiteUrl: blog_one.websiteUrl
            },
            SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        );

        expect(res.body).toEqual({
            'errorsMessages': [
                {
                    'field': 'description',
                    'message': 'The length of the "description" field should be from 1 to 500.',
                }
            ]

        });

        console_log(res.body, res.status, 'Test 8: post(/blogs)\n');
    });
    it('should not create a new blog if incorrect data is specified in the request body (the "description" field consists of more than 500 characters).', async () => {
        const res = await blogsTestManager.createBlog(
            {
                name: blog_one.name,
                description: generateRandomString(501),
                websiteUrl: blog_one.websiteUrl
            },
            SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        );

        expect(res.body).toEqual({
            'errorsMessages': [
                {
                    'field': 'description',
                    'message': 'The length of the "description" field should be from 1 to 500.',
                }
            ]

        });

        console_log(res.body, res.status, 'Test 9: post(/blogs)\n');
    });
});
