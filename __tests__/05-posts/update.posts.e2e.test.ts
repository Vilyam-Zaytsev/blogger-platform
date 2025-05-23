import {console_log_e2e, encodingAdminDataInBase64, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, postContents, postShortDescriptions, postTitles, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {ObjectId} from "mongodb";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {Response} from "supertest";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import mongoose from "mongoose";
import {PostViewModel} from "../../src/05-posts/domain/post-entity";
import {LikeStatus} from "../../src/07-likes/like-entity";

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

    describe('PUT /posts', () => {

        it('should update post, the admin is authenticated.', async () => {

           await blogsTestManager
               .createBlog(1);

           await postsTestManager
               .createPost(1);

            const resUpdatePost: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send(
                    {
                        title: postTitles[1],
                        shortDescription: postShortDescriptions[1],
                        content: postContents[1],
                        blogId: presets.blogs[0].id
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id);

            expect(foundPost).toEqual(
                {
                    id: expect.any(String),
                    title: postTitles[1],
                    shortDescription: postShortDescriptions[1],
                    content: postContents[1],
                    blogId: presets.blogs[0].id,
                    blogName: presets.blogs[0].name,
                    extendedLikesInfo: {
                        likesCount: 0,
                        dislikesCount: 0,
                        myStatus: LikeStatus.None,
                        newestLikes: []
                    },
                    createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
                }
            )

            console_log_e2e(resUpdatePost.body, resUpdatePost.status, 'Test 1: put(/posts/:id)');
        });

        it('should not update the post if the admin has not been authenticated.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resUpdatePost: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .send(
                    {
                        title: postTitles[1],
                        shortDescription: postShortDescriptions[1],
                        content: postContents[1],
                        blogId: presets.blogs[0].id
                    }
                )
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id);

            expect(foundPost).toEqual(presets.posts[0]);


            console_log_e2e(resUpdatePost.body, resUpdatePost.status, 'Test 2: put(/posts/:id)');
        });

        it('should not update a post if the data in the request body is incorrect (an empty object is passed).', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resUpdatePost: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({})
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resUpdatePost.body).toEqual({
                errorsMessages: [
                    {
                        field: 'title',
                        message: 'The "title" field must be of the string type.'
                    },
                    {
                        field: 'shortDescription',
                        message: 'The "shortDescription" field must be of the string type.'
                    },
                    {
                        field: 'content',
                        message: 'The "content" field must be of the string type.'
                    },
                    {
                        field: 'blogId',
                        message: 'The "blogId" field must be of the string type.'
                    }
                ]
            });

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id);

            expect(foundPost).toEqual(presets.posts[0]);

            console_log_e2e(resUpdatePost.body, resUpdatePost.status, 'Test 3: put(/posts/:id)');
        });

        it('should not update a blog if the data in the request body is incorrect (title: empty line,  short Description: empty line, content: empty line, blogId: empty line).', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resUpdatePost: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({
                    title: '   ',
                    shortDescription: '   ',
                    content: '   ',
                    blogId: '   ',
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resUpdatePost.body).toEqual({
                errorsMessages: [
                    {
                        field: 'title',
                        message: 'The length of the "title" field should be from 1 to 30.'
                    },
                    {
                        field: 'shortDescription',
                        message: 'The length of the "shortDescription" field should be from 1 to 100.'
                    },
                    {
                        field: 'content',
                        message: 'The length of the "content" field should be from 1 to 1000.'
                    },
                    {
                        field: 'blogId',
                        message: 'A blog with such an ID does not exist.'
                    }
                ]
            });

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id);

            expect(foundPost).toEqual(presets.posts[0]);

            console_log_e2e(resUpdatePost.body, resUpdatePost.status, 'Test 4: put(/posts/:id)');
        });

        it('should not update a blog if the data in the request body is incorrect (title: exceeds max length, shortDescription: exceeds max length, content: exceeds max length, blogId: incorrect).', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resUpdatePost: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({
                    title: generateRandomString(31),
                    shortDescription: generateRandomString(101),
                    content: generateRandomString(1001),
                    blogId: generateRandomString(10),
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resUpdatePost.body).toEqual({
                errorsMessages: [
                    {
                        field: 'title',
                        message: 'The length of the "title" field should be from 1 to 30.'
                    },
                    {
                        field: 'shortDescription',
                        message: 'The length of the "shortDescription" field should be from 1 to 100.'
                    },
                    {
                        field: 'content',
                        message: 'The length of the "content" field should be from 1 to 1000.'
                    },
                    {
                        field: 'blogId',
                        message: 'A blog with such an ID does not exist.'
                    }
                ]
            });

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id);

            expect(foundPost).toEqual(presets.posts[0]);

            console_log_e2e(resUpdatePost.body, resUpdatePost.status, 'Test 5: put(/posts/:id)');
        });

        it('should not update a blog if the data in the request body is incorrect (title: type number, shortDescription: type number, content: type number, blogId: incorrect).', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resUpdatePost: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({
                    title: 123,
                    shortDescription: 123,
                    content: 123,
                    blogId: 123,
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resUpdatePost.body).toEqual({
                errorsMessages: [
                    {
                        field: 'title',
                        message: 'The "title" field must be of the string type.'
                    },
                    {
                        field: 'shortDescription',
                        message: 'The "shortDescription" field must be of the string type.'
                    },
                    {
                        field: 'content',
                        message: 'The "content" field must be of the string type.'
                    },
                    {
                        field: 'blogId',
                        message: 'The "blogId" field must be of the string type.'
                    }
                ]
            });

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id);

            expect(foundPost).toEqual(presets.posts[0]);

            console_log_e2e(resUpdatePost.body, resUpdatePost.status, 'Test 6: put(/posts/:id)');
        });

        it('should return a 404 error if the post does not exist..', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resUpdatePost: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${new ObjectId()}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .send({
                    title: postTitles[1],
                    shortDescription: postShortDescriptions[1],
                    content: postContents[1],
                    blogId: presets.blogs[0].id
                })
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id);

            expect(foundPost).toEqual(presets.posts[0]);

            console_log_e2e(resUpdatePost.body, resUpdatePost.status, 'Test 7: put(/posts/:id)');
        });
    });
