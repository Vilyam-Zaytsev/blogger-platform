import {console_log_e2e, encodingAdminDataInBase64, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/03_blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {blogsCollection, postsCollection, setBlogsCollection, setPostsCollection} from "../../src/db/mongoDb";
import {BlogDbType} from "../../src/03-blogs/types/blog-db-type";
import {PostDbType} from "../../src/04-posts/types/post-db-type";
import {postsTestManager} from "../helpers/managers/04_posts-test-manager";
import {Response} from "supertest";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {PostViewModel} from "../../src/04-posts/types/input-output-types";

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
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});

    clearPresets();
});

    describe('DELETE /posts', () => {

        it('should delete post, the admin is authenticated.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resDeletePost: Response = await req
                .delete(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            const foundPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(foundPosts.items.length).toEqual(0);

            console_log_e2e(resDeletePost.body, resDeletePost.status, 'Test 1: delete(/posts/:id)');
        });

        it('should not delete blog, the admin is not authenticated.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resDeletePost: Response = await req
                .delete(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const foundPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(foundPosts.items[0]).toEqual(presets.posts[0]);
            expect(foundPosts.items.length).toEqual(1);

            console_log_e2e(resDeletePost.body, resDeletePost.status, 'Test 2: delete(/posts/:id)');
        });

        it('should return a 404 error if the blog was not found by the passed ID in the parameters.', async () => {

            await blogsTestManager
                .createBlog(1);

            await postsTestManager
                .createPost(1);

            const resDeletePost: Response = await req
                .delete(`${SETTINGS.PATH.POSTS}/${new ObjectId()}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const foundPosts: Paginator<PostViewModel> = await postsTestManager
                .getPosts();

            expect(foundPosts.items[0]).toEqual(presets.posts[0]);
            expect(foundPosts.items.length).toEqual(1);

            console_log_e2e(resDeletePost.body, resDeletePost.status, 'Test 3: delete(/posts/:id)');
        });
    });
