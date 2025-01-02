import {console_log, encodingAdminDataInBase64, generateRandomString, req} from './helpers/test-helpers';
import {SETTINGS} from "../src/settings";
import {blog, post} from "./helpers/datasets-for-tests";
import {blogsTestManager} from "./helpers/blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {postsCollection, setBlogsCollection, setPostsCollection} from "../src/db/mongoDb";
import {BlogDbType} from "../src/types/db-types/blog-db-type";
import {PostDbType} from "../src/types/db-types/post-db-type";
import {postsTestManager} from "./helpers/posts-test-manager";
import {Response} from "supertest";

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
    await postsCollection.deleteMany({});
});


describe('/posts', () => {
    describe('POST /posts', () => {
        it('should create a new post, the user is authenticated.', async () => {
            const res_POST_blog: Response[] = await blogsTestManager.createBlog(
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

            expect(res_POST_blog[0].body).toEqual({
                id: expect.any(String),
                name: `${blog.name}_1`,
                description: `${blog.description}_1`,
                websiteUrl: blog.websiteUrl,
                isMembership: blog.isMembership,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const res_POST_post: Response[] = await postsTestManager.createPost(
                1,
                {
                    title: post.title,
                    shortDescription: post.shortDescription,
                    content: post.content,
                    blogId: res_POST_blog[0].body.id
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            );

            console.log(post)


            // for (let i = 0; i < res_POST_post.length; i++) {
            //     expect(res_POST_post[i].body).toEqual({
            //         id: expect.any(String),
            //         title: `${post.title}_${i + 1}`,
            //         shortDescription: `${post.shortDescription}_${i + 1}`,
            //         content: `${post.content}_${i + 1}`,
            //         blogId: res_POST_blog[0].body.id,
            //         // blogName: res_POST_post[0].blogName,
            //         createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            //     });
            // }
            //
            //
            //
            // const res_GET_post = await req
            //     .get(`${SETTINGS.PATH.POSTS}/${res_POST_post[0].body.id}`)
            //     .expect(SETTINGS.HTTP_STATUSES.OK_200);
            //
            // expect(res_POST_post[0].body).toEqual(res_GET_post.body);
            //
            // console_log(res_POST_post[0].body, res_POST_post[0].status, 'Test 1: post(/blogs)\n');
        });
        // it('should not create a post if the user is not authenticated.', async () => {
        //     const resCreateBlog = await blogsTestManager.createBlog(
        //         {
        //             name: blog_1.name,
        //             description: blog_1.description,
        //             websiteUrl: blog_1.websiteUrl
        //         },
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         )
        //     );
        //
        //     expect(resCreateBlog.body).toEqual({
        //         id: expect.any(String),
        //         name: blog_1.name,
        //         description: blog_1.description,
        //         websiteUrl: blog_1.websiteUrl,
        //         isMembership: blog_1.isMembership,
        //         createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        //     });
        //
        //     const resCreatePost = await postsTestManager.createPost(
        //         {
        //             title: post_1.title,
        //             shortDescription: post_1.shortDescription,
        //             content: post_1.content,
        //             blogId: resCreateBlog.body.id
        //         },
        //         encodingAdminDataInBase64(
        //             'incorrect_login',
        //             'incorrect_password'
        //         ),
        //         SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401
        //     );
        //
        //     await req
        //         .get(SETTINGS.PATH.POSTS)
        //         .expect(SETTINGS.HTTP_STATUSES.OK_200, [])
        //
        //     console_log(resCreatePost.body, resCreatePost.status, 'Test 2: post(/blogs)\n');
        // });
        // it('should not create a post if the data in the request body is incorrect.', async () => {
        //     const resCreateBlog = await blogsTestManager.createBlog(
        //         {
        //             name: blog_1.name,
        //             description: blog_1.description,
        //             websiteUrl: blog_1.websiteUrl
        //         },
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         )
        //     );
        //
        //     expect(resCreateBlog.body).toEqual({
        //         id: expect.any(String),
        //         name: blog_1.name,
        //         description: blog_1.description,
        //         websiteUrl: blog_1.websiteUrl,
        //         isMembership: blog_1.isMembership,
        //         createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        //     });
        //
        //     const resCreatePost = await postsTestManager.createPost(
        //         {},
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         ),
        //         SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        //     );
        //
        //     expect(resCreatePost.body).toEqual(
        //         {
        //             errorsMessages: [
        //                 {
        //                     field: 'title',
        //                     message: 'The "title" field must be of the string type.'
        //                 },
        //                 {
        //                     field: 'shortDescription',
        //                     message: 'The "shortDescription" field must be of the string type.'
        //                 },
        //                 {
        //                     field: 'content',
        //                     message: 'The "content" field must be of the string type.'
        //                 },
        //                 {
        //                     field: 'blogId',
        //                     message: 'The "blogId" field must be of the string type.'
        //                 }
        //             ]
        //         },
        //     );
        //
        //     await req
        //         .get(SETTINGS.PATH.POSTS)
        //         .expect(SETTINGS.HTTP_STATUSES.OK_200, []);
        //
        //     console_log(resCreatePost.body, resCreatePost.status, 'Test 3: post(/blogs)\n');
        // });
        // it('should not create a post if the data in the request body is incorrect.', async () => {
        //     const resCreateBlog = await blogsTestManager.createBlog(
        //         {
        //             name: blog_1.name,
        //             description: blog_1.description,
        //             websiteUrl: blog_1.websiteUrl
        //         },
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         )
        //     );
        //
        //     expect(resCreateBlog.body).toEqual({
        //         id: expect.any(String),
        //         name: blog_1.name,
        //         description: blog_1.description,
        //         websiteUrl: blog_1.websiteUrl,
        //         isMembership: blog_1.isMembership,
        //         createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        //     });
        //
        //     const resCreatePost = await postsTestManager.createPost(
        //         {
        //             title: '   ',
        //             shortDescription: '   ',
        //             content: '   ',
        //             blogId: '   '
        //         },
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         ),
        //         SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        //     );
        //
        //     expect(resCreatePost.body).toEqual(
        //         {
        //             errorsMessages: [
        //                 {
        //                     field: 'title',
        //                     message: 'The length of the "title" field should be from 1 to 30.'
        //                 },
        //                 {
        //                     field: 'shortDescription',
        //                     message: 'The length of the "shortDescription" field should be from 1 to 100.'
        //                 },
        //                 {
        //                     field: 'content',
        //                     message: 'The length of the "content" field should be from 1 to 1000.'
        //                 },
        //                 {
        //                     field: 'blogId',
        //                     message: 'A blog with such an ID does not exist.'
        //                 }
        //             ]
        //         },
        //     );
        //
        //     await req
        //         .get(SETTINGS.PATH.POSTS)
        //         .expect(SETTINGS.HTTP_STATUSES.OK_200, []);
        //
        //     console_log(resCreatePost.body, resCreatePost.status, 'Test 4: post(/blogs)\n');
        // });
        // it('should not create a post if the data in the request body is incorrect.', async () => {
        //     const resCreateBlog = await blogsTestManager.createBlog(
        //         {
        //             name: blog_1.name,
        //             description: blog_1.description,
        //             websiteUrl: blog_1.websiteUrl
        //         },
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         )
        //     );
        //
        //     expect(resCreateBlog.body).toEqual({
        //         id: expect.any(String),
        //         name: blog_1.name,
        //         description: blog_1.description,
        //         websiteUrl: blog_1.websiteUrl,
        //         isMembership: blog_1.isMembership,
        //         createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        //     });
        //
        //     const resCreatePost = await postsTestManager.createPost(
        //         {
        //             title: generateRandomString(31),
        //             shortDescription: generateRandomString(101),
        //             content: generateRandomString(1001),
        //             blogId: generateRandomString(10)
        //         },
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         ),
        //         SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        //     );
        //
        //     expect(resCreatePost.body).toEqual(
        //         {
        //             errorsMessages: [
        //                 {
        //                     field: 'title',
        //                     message: 'The length of the "title" field should be from 1 to 30.'
        //                 },
        //                 {
        //                     field: 'shortDescription',
        //                     message: 'The length of the "shortDescription" field should be from 1 to 100.'
        //                 },
        //                 {
        //                     field: 'content',
        //                     message: 'The length of the "content" field should be from 1 to 1000.'
        //                 },
        //                 {
        //                     field: 'blogId',
        //                     message: 'A blog with such an ID does not exist.'
        //                 }
        //             ]
        //         },
        //     );
        //
        //     await req
        //         .get(SETTINGS.PATH.POSTS)
        //         .expect(SETTINGS.HTTP_STATUSES.OK_200, []);
        //
        //     console_log(resCreatePost.body, resCreatePost.status, 'Test 5: post(/blogs)\n');
        // });
        // it('should not create a post if the data in the request body is incorrect.', async () => {
        //     const resCreateBlog = await blogsTestManager.createBlog(
        //         {
        //             name: blog_1.name,
        //             description: blog_1.description,
        //             websiteUrl: blog_1.websiteUrl
        //         },
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         )
        //     );
        //
        //     expect(resCreateBlog.body).toEqual({
        //         id: expect.any(String),
        //         name: blog_1.name,
        //         description: blog_1.description,
        //         websiteUrl: blog_1.websiteUrl,
        //         isMembership: blog_1.isMembership,
        //         createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        //     });
        //
        //     const resCreatePost = await postsTestManager.createPost(
        //         {
        //             title: 123,
        //             shortDescription: 123,
        //             content: 123,
        //             blogId: 123
        //         },
        //         encodingAdminDataInBase64(
        //             SETTINGS.ADMIN_DATA.LOGIN,
        //             SETTINGS.ADMIN_DATA.PASSWORD
        //         ),
        //         SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
        //     );
        //
        //     expect(resCreatePost.body).toEqual(
        //         {
        //             errorsMessages: [
        //                 {
        //                     field: 'title',
        //                     message: 'The "title" field must be of the string type.'
        //                 },
        //                 {
        //                     field: 'shortDescription',
        //                     message: 'The "shortDescription" field must be of the string type.'
        //                 },
        //                 {
        //                     field: 'content',
        //                     message: 'The "content" field must be of the string type.'
        //                 },
        //                 {
        //                     field: 'blogId',
        //                     message: 'The "blogId" field must be of the string type.'
        //                 }
        //             ]
        //         },
        //     );
        //
        //     await req
        //         .get(SETTINGS.PATH.POSTS)
        //         .expect(SETTINGS.HTTP_STATUSES.OK_200, []);
        //
        //     console_log(resCreatePost.body, resCreatePost.status, 'Test 6: post(/blogs)\n');
        // });
    });
    // describe('GET /posts', () => {
    //     it('should return an empty array.', async () => {
    //         const res = await req
    //             .get(SETTINGS.PATH.POSTS)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200, [])
    //
    //         console_log(res.body, res.status, 'Test 1: get(/blogs)\n');
    //     });
    //     it('should return an array with a single blog.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resGetPosts = await req
    //             .get(SETTINGS.PATH.POSTS)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resGetPosts.body[0]).toEqual(resCreatePost.body);
    //         expect(resGetPosts.body.length).toEqual(1);
    //
    //         console_log(resGetPosts.body, resGetPosts.status, 'Test 2: get(/blogs)\n');
    //     });
    //     it('should return an array with a two posts.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost_1 = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost_1.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost_2 = await postsTestManager.createPost(
    //             {
    //                 title: post_2.title,
    //                 shortDescription: post_2.shortDescription,
    //                 content: post_2.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost_2.body).toEqual({
    //             id: expect.any(String),
    //             title: post_2.title,
    //             shortDescription: post_2.shortDescription,
    //             content: post_2.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resGetPosts = await req
    //             .get(SETTINGS.PATH.POSTS)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resGetPosts.body[0]).toEqual(resCreatePost_1.body);
    //         expect(resGetPosts.body[1]).toEqual(resCreatePost_2.body);
    //         expect(resGetPosts.body.length).toEqual(2);
    //
    //         console_log(resGetPosts.body, resGetPosts.status, 'Test 3: get(/blogs)\n');
    //     });
    //     it('should return post found by id.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resGetPost = await req
    //             .get(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resCreatePost.body).toEqual(resGetPost.body);
    //
    //         console_log(resGetPost.body, resGetPost.status, 'Test 4: get(/blogs)\n');
    //     });
    //     it('should return error 404 not found.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resGetPost_1 = await req
    //             .get(`${SETTINGS.PATH.POSTS}/${new ObjectId()}`)
    //             .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);
    //
    //         const resGetPost_2 = await req
    //             .get(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resGetPost_2.body).toEqual(resCreatePost.body);
    //
    //         console_log(resGetPost_1.body, resGetPost_1.status, 'Test 5: get(/blogs)\n');
    //     });
    // });
    // describe('PUT /blogs', () => {
    //     it('should update post, the user is authenticated.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resUpdatePost = await req
    //             .put(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .set({
    //                 'Authorization': encodingAdminDataInBase64(
    //                     SETTINGS.ADMIN_DATA.LOGIN,
    //                     SETTINGS.ADMIN_DATA.PASSWORD
    //                 )
    //             })
    //             .send(
    //                 {
    //                     title: post_2.title,
    //                     shortDescription: post_2.shortDescription,
    //                     content: post_2.content,
    //                     blogId: resCreateBlog.body.id,
    //                 }
    //             )
    //             .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    //
    //         const resGetPost = await req
    //             .get(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resGetPost.body).toEqual(
    //             {
    //                 id: expect.any(String),
    //                 title: post_2.title,
    //                 shortDescription: post_2.shortDescription,
    //                 content: post_2.content,
    //                 blogId: resCreateBlog.body.id,
    //                 blogName: resCreateBlog.body.name,
    //                 createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //             }
    //         )
    //
    //         console_log(resUpdatePost.body, resUpdatePost.status, 'Test 1: post(/blogs)\n');
    //     });
    //     it('should not update the post if the user has not been authenticated.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resUpdatePost = await req
    //             .put(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .set({
    //                 'Authorization': encodingAdminDataInBase64(
    //                     'incorrect_login',
    //                     'incorrect_password'
    //                 )
    //             })
    //             .send(
    //                 {
    //                     title: post_2.title,
    //                     shortDescription: post_2.shortDescription,
    //                     content: post_2.content,
    //                     blogId: resCreateBlog.body.id,
    //                 }
    //             )
    //             .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
    //
    //         const resGetPost = await req
    //             .get(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resGetPost.body).toEqual(resCreatePost.body);
    //
    //
    //         console_log(resUpdatePost.body, resUpdatePost.status, 'Test 2: post(/blogs)\n');
    //     });
    //     it('should not update a post if the data in the request body is incorrect.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resUpdatePost = await req
    //             .put(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .set({
    //                 'Authorization': encodingAdminDataInBase64(
    //                     SETTINGS.ADMIN_DATA.LOGIN,
    //                     SETTINGS.ADMIN_DATA.PASSWORD
    //                 )
    //             })
    //             .send({})
    //             .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //         const resGetPost = await req
    //             .get(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resGetPost.body).toEqual(resCreatePost.body);
    //
    //         expect(resUpdatePost.body).toEqual({
    //             errorsMessages: [
    //                 {
    //                     field: 'title',
    //                     message: 'The "title" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'shortDescription',
    //                     message: 'The "shortDescription" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'content',
    //                     message: 'The "content" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'blogId',
    //                     message: 'The "blogId" field must be of the string type.'
    //                 }
    //             ]
    //         });
    //
    //         console_log(resUpdatePost.body, resUpdatePost.status, 'Test 3: post(/blogs)\n');
    //     });
    //     it('should not update a blog if the data in the request body is incorrect.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resUpdatePost = await req
    //             .put(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .set({
    //                 'Authorization': encodingAdminDataInBase64(
    //                     SETTINGS.ADMIN_DATA.LOGIN,
    //                     SETTINGS.ADMIN_DATA.PASSWORD
    //                 )
    //             })
    //             .send(
    //                 {
    //                     title: '   ',
    //                     shortDescription: '   ',
    //                     content: '   ',
    //                     blogId: '   ',
    //                 }
    //             )
    //             .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //         const resGetPost = await req
    //             .get(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resGetPost.body).toEqual(resCreatePost.body);
    //
    //         expect(resUpdatePost.body).toEqual({
    //             errorsMessages: [
    //                 {
    //                     field: 'title',
    //                     message: 'The length of the "title" field should be from 1 to 30.'
    //                 },
    //                 {
    //                     field: 'shortDescription',
    //                     message: 'The length of the "shortDescription" field should be from 1 to 100.'
    //                 },
    //                 {
    //                     field: 'content',
    //                     message: 'The length of the "content" field should be from 1 to 1000.'
    //                 },
    //                 {
    //                     field: 'blogId',
    //                     message: 'A blog with such an ID does not exist.'
    //                 }
    //             ]
    //         });
    //
    //         console_log(resUpdatePost.body, resUpdatePost.status, 'Test 4: post(/blogs)\n');
    //     });
    //     it('should not update a blog if the data in the request body is incorrect.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resUpdatePost = await req
    //             .put(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .set({
    //                 'Authorization': encodingAdminDataInBase64(
    //                     SETTINGS.ADMIN_DATA.LOGIN,
    //                     SETTINGS.ADMIN_DATA.PASSWORD
    //                 )
    //             })
    //             .send(
    //                 {
    //                     title: generateRandomString(31),
    //                     shortDescription: generateRandomString(101),
    //                     content: generateRandomString(1001),
    //                     blogId: generateRandomString(10),
    //                 }
    //             )
    //             .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //         const resGetPost = await req
    //             .get(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resGetPost.body).toEqual(resCreatePost.body);
    //
    //         expect(resUpdatePost.body).toEqual({
    //             errorsMessages: [
    //                 {
    //                     field: 'title',
    //                     message: 'The length of the "title" field should be from 1 to 30.'
    //                 },
    //                 {
    //                     field: 'shortDescription',
    //                     message: 'The length of the "shortDescription" field should be from 1 to 100.'
    //                 },
    //                 {
    //                     field: 'content',
    //                     message: 'The length of the "content" field should be from 1 to 1000.'
    //                 },
    //                 {
    //                     field: 'blogId',
    //                     message: 'A blog with such an ID does not exist.'
    //                 }
    //             ]
    //         });
    //
    //         console_log(resUpdatePost.body, resUpdatePost.status, 'Test 5: post(/blogs)\n');
    //     });
    //     it('should not update a blog if the data in the request body is incorrect.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resUpdatePost = await req
    //             .put(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .set({
    //                 'Authorization': encodingAdminDataInBase64(
    //                     SETTINGS.ADMIN_DATA.LOGIN,
    //                     SETTINGS.ADMIN_DATA.PASSWORD
    //                 )
    //             })
    //             .send(
    //                 {
    //                     title: 123,
    //                     shortDescription: 123,
    //                     content: 123,
    //                     blogId: 123,
    //                 }
    //             )
    //             .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //         const resGetPost = await req
    //             .get(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resGetPost.body).toEqual(resCreatePost.body);
    //
    //         expect(resUpdatePost.body).toEqual({
    //             errorsMessages: [
    //                 {
    //                     field: 'title',
    //                     message: 'The "title" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'shortDescription',
    //                     message: 'The "shortDescription" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'content',
    //                     message: 'The "content" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'blogId',
    //                     message: 'The "blogId" field must be of the string type.'
    //                 }
    //             ]
    //         });
    //
    //         console_log(resUpdatePost.body, resUpdatePost.status, 'Test 6: post(/blogs)\n');
    //     });
    // });
    // describe('DELETE /blogs', () => {
    //     it('should delete post, the user is authenticated.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resDeletePost = await req
    //             .delete(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .set({
    //                 'Authorization': encodingAdminDataInBase64(
    //                     SETTINGS.ADMIN_DATA.LOGIN,
    //                     SETTINGS.ADMIN_DATA.PASSWORD
    //                 )
    //             })
    //             .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    //
    //         await req
    //             .get(SETTINGS.PATH.POSTS)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200, []);
    //
    //         console_log(resDeletePost.body, resDeletePost.status, 'Test 1: post(/blogs)\n');
    //     });
    //     it('should not delete blog, the user is not authenticated.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resDeletePost = await req
    //             .delete(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .set({
    //                 'Authorization': encodingAdminDataInBase64(
    //                     'incorrect_login',
    //                     'incorrect_password'
    //                 )
    //             })
    //             .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
    //
    //         const resGetPost = await req
    //             .get(`${SETTINGS.PATH.POSTS}/${resCreatePost.body.id}`)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resCreatePost.body).toEqual(resGetPost.body)
    //
    //         console_log(resDeletePost.body, resDeletePost.status, 'Test 2: post(/blogs)\n');
    //     });
    //     it('should return a 404 error if the blog was not found by the passed ID in the parameters.', async () => {
    //         const resCreateBlog = await blogsTestManager.createBlog(
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
    //         expect(resCreateBlog.body).toEqual({
    //             id: expect.any(String),
    //             name: blog_1.name,
    //             description: blog_1.description,
    //             websiteUrl: blog_1.websiteUrl,
    //             isMembership: blog_1.isMembership,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resCreatePost = await postsTestManager.createPost(
    //             {
    //                 title: post_1.title,
    //                 shortDescription: post_1.shortDescription,
    //                 content: post_1.content,
    //                 blogId: resCreateBlog.body.id
    //             },
    //             encodingAdminDataInBase64(
    //                 SETTINGS.ADMIN_DATA.LOGIN,
    //                 SETTINGS.ADMIN_DATA.PASSWORD
    //             )
    //         );
    //
    //         expect(resCreatePost.body).toEqual({
    //             id: expect.any(String),
    //             title: post_1.title,
    //             shortDescription: post_1.shortDescription,
    //             content: post_1.content,
    //             blogId: resCreateBlog.body.id,
    //             blogName: post_1.blogName,
    //             createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
    //         });
    //
    //         const resDeletePost = await req
    //             .delete(`${SETTINGS.PATH.POSTS}/${new ObjectId()}`)
    //             .set({
    //                 'Authorization': encodingAdminDataInBase64(
    //                     SETTINGS.ADMIN_DATA.LOGIN,
    //                     SETTINGS.ADMIN_DATA.PASSWORD
    //                 )
    //             })
    //             .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);
    //
    //         const resGetPost = await req
    //             .get(SETTINGS.PATH.POSTS)
    //             .expect(SETTINGS.HTTP_STATUSES.OK_200);
    //
    //         expect(resGetPost.body.length).toEqual(1)
    //
    //         console_log(resDeletePost.body, resDeletePost.status, 'Test 3: post(/blogs)\n');
    //     });
    // });
});
