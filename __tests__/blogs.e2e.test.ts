import {clearDb, console_log, encodingAdminDataInBase64, generateRandomString, req} from './helpers/test-helpers';
import {SETTINGS} from "../src/settings";
import {blog_1} from "./helpers/datasets-for-tests";
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
    // blogsCollection = db.collection<BlogDbType>('blogs');
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await blogsCollection.deleteMany({});
});


describe('/blogs', () => {
    // describe('POST /blogs', () => {
    //     it('should create a new blog, the user is authenticated.', async () => {
    //         const res = await blogsTestManager.createBlog(
    //             {
    //                 name: blog_1.name,
    //                 description: blog_1.description,
    //                 websiteUrl: blog_1.websiteUrl
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(res.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl
    //         });
    //
    //         expect(res.body).toEqual(db.blogs[0]);
    //
    //         console_log(res.body, res.status, 'Test 1: post(/blogs)\n');
    //     });
    //     it('should not create a blog if the user is not authenticated.', async () => {
    //         clearDb();
    //
    //         const res = await blogsTestManager.createBlog(
    //             {
    //                 name: blog_1.name,
    //                 description: blog_1.description,
    //                 websiteUrl: blog_1.websiteUrl
    //             },
    //             'incorect-adminData',
    //             SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401
    //         );
    //
    //         expect(db.blogs.length).toEqual(0);
    //
    //         console_log(res.body, res.status, 'Test 2: post(/blogs)\n');
    //     });
    //     it('should not create a blog if the data in the request body is incorrect.', async () => {
    //         clearDb();
    //
    //         const res = await blogsTestManager.createBlog(
    //             {},
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             ),
    //             SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
    //         );
    //
    //         expect(db.blogs.length).toEqual(0);
    //         expect(res.body).toEqual(
    //             {
    //                 errorsMessages: [
    //                     {
    //                         field: 'name',
    //                         message: 'The "name" field must be of the string type.'
    //                     },
    //                     {
    //                         field: 'description',
    //                         message: 'The "description" field must be of the string type.'
    //                     },
    //                     {
    //                         field: 'websiteUrl',
    //                         message: 'The "websiteUrl" field must be of the string type.'
    //                     }
    //                 ]
    //             },
    //         )
    //
    //         console_log(res.body, res.status, 'Test 3: post(/blogs)\n');
    //     });
    //     it('should not create a blog if the data in the request body is incorrect.', async () => {
    //         clearDb();
    //
    //         const res = await blogsTestManager.createBlog(
    //             {
    //                 name: '   ',
    //                 description: '   ',
    //                 websiteUrl: '   '
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             ),
    //             SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
    //         );
    //
    //         expect(db.blogs.length).toEqual(0);
    //         expect(res.body).toEqual(
    //             {
    //                 errorsMessages: [
    //                     {
    //                         field: 'name',
    //                         message: 'The length of the "name" field should be from 1 to 15.'
    //                     },
    //                     {
    //                         field: 'description',
    //                         message: 'The length of the "description" field should be from 1 to 500.'
    //                     },
    //                     {
    //                         field: 'websiteUrl',
    //                         message: 'The length of the "description" field should be from 1 to 100.'
    //                     }
    //                 ]
    //             },
    //         )
    //
    //         console_log(res.body, res.status, 'Test 4: post(/blogs)\n');
    //     });
    //     it('should not create a blog if the data in the request body is incorrect.', async () => {
    //         clearDb();
    //
    //         const res = await blogsTestManager.createBlog(
    //             {
    //                 name: generateRandomString(16),
    //                 description: generateRandomString(501),
    //                 websiteUrl: generateRandomString(101)
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             ),
    //             SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
    //         );
    //
    //         expect(db.blogs.length).toEqual(0);
    //         expect(res.body).toEqual(
    //             {
    //                 errorsMessages: [
    //                     {
    //                         field: 'name',
    //                         message: 'The length of the "name" field should be from 1 to 15.'
    //                     },
    //                     {
    //                         field: 'description',
    //                         message: 'The length of the "description" field should be from 1 to 500.'
    //                     },
    //                     {
    //                         field: 'websiteUrl',
    //                         message: 'The length of the "description" field should be from 1 to 100.'
    //                     }
    //                 ]
    //             },
    //         )
    //
    //         console_log(res.body, res.status, 'Test 5: post(/blogs)\n');
    //     });
    //     it('should not create a blog if the data in the request body is incorrect.', async () => {
    //         clearDb();
    //
    //         const res = await blogsTestManager.createBlog(
    //             {
    //                 name: 123,
    //                 description: 123,
    //                 websiteUrl: 123
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             ),
    //             SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
    //         );
    //
    //         expect(db.blogs.length).toEqual(0);
    //         expect(res.body).toEqual(
    //             {
    //                 errorsMessages: [
    //                     {
    //                         field: 'name',
    //                         message: 'The "name" field must be of the string type.'
    //                     },
    //                     {
    //                         field: 'description',
    //                         message: 'The "description" field must be of the string type.'
    //                     },
    //                     {
    //                         field: 'websiteUrl',
    //                         message: 'The "websiteUrl" field must be of the string type.'
    //                     }
    //                 ]
    //             },
    //         )
    //
    //         console_log(res.body, res.status, 'Test 6: post(/blogs)\n');
    //     });
    //     it('should not create a blog if the data in the request body is incorrect.', async () => {
    //         clearDb();
    //
    //         const res = await blogsTestManager.createBlog(
    //             {
    //                 name: blog_1.name,
    //                 description: blog_1.description,
    //                 websiteUrl: generateRandomString(10)
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             ),
    //             SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
    //         );
    //
    //         expect(db.blogs.length).toEqual(0);
    //         expect(res.body).toEqual(
    //             {
    //                 errorsMessages: [
    //                     {
    //                         field: 'websiteUrl',
    //                         message: 'Invalid URL. The field must start with "https://" and match the pattern: "https://example.com/path".'
    //                     }
    //                 ]
    //             },
    //         )
    //
    //         console_log(res.body, res.status, 'Test 7: post(/blogs)\n');
    //     });
    // });
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
            // expect(db.blogs.length).toEqual(1);


            console_log(res_2.body, res_2.status, 'Test 2: get(/blogs)\n');
        });
        it('should return an array with a two blogs.', async () => {
            clearDb();

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
                    name: blog_1.name,
                    description: blog_1.description,
                    websiteUrl: blog_1.websiteUrl
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
            // expect(db.blogs.length).toEqual(2);


            console_log(res_3.body, res_3.status, 'Test 3: get(/blogs)\n');
        });
    });
});





