import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {
    blogsCollection,
    commentsCollection,
    postsCollection,
    setBlogsCollection,
    setCommentsCollection,
    setPostsCollection,
    setUsersCollection,
    usersCollection
} from "../../src/db/mongoDb";
import {UserDbType} from "../../src/03-users/types/user-db-type";
import {BlogDbType} from "../../src/04-blogs/types/blog-db-type";
import {PostDbType} from "../../src/05-posts/types/post-db-type";
import {CommentDbType} from "../../src/06-comments/types/comment-db-type";
import {
    clearPresets,
    comments,
    incorrectAccessToken,
    presets
} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/03_blogs-test-manager";
import {postsTestManager} from "../helpers/managers/04_posts-test-manager";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {Response} from "supertest";
import {console_log_e2e, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {CommentViewModel} from "../../src/06-comments/types/input-output-types";
import {commentsTestManager} from "../helpers/managers/05_comments-test-manager";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setUsersCollection(db.collection<UserDbType>('users'));
    setBlogsCollection(db.collection<BlogDbType>('blogs'));
    setPostsCollection(db.collection<PostDbType>('posts'));
    setCommentsCollection(db.collection<CommentDbType>('comments'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});
    await blogsCollection.deleteMany({});
    await postsCollection.deleteMany({});
    await commentsCollection.deleteMany({});

    clearPresets();
});

describe('DELETE /comments', () => {

    it('should delete the comment if the user is logged in.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(1);

        const resDeleteComment: Response = await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(0);

        console_log_e2e(resDeleteComment.body, resDeleteComment.status, 'Test 1: delete(/comments/:id)');
    });

    it('should not delete the comment if the user is not logged in.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(1);

        const resDeleteComment: Response = await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                incorrectAccessToken
            )
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(1);

        console_log_e2e(resDeleteComment.body, resDeleteComment.status, 'Test 2: delete(/comments/:id)');
    });

    it('should not delete comments if the user in question is not the owner of the comment.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(2);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(1);

        const resDeleteComment: Response = await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[1].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.FORBIDDEN_403);

        await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        console_log_e2e(resDeleteComment.body, resDeleteComment.status, 'Test 3: delete(/comments/:id)');
    });

    it('should not delete comments if the comment does not exist.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(1);

        const resDeleteComment: Response = await req
            .delete(`${SETTINGS.PATH.COMMENTS}/${new ObjectId()}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const foundComments: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        expect(foundComments.items.length).toEqual(1);

        console_log_e2e(resDeleteComment.body, resDeleteComment.status, 'Test 4: delete(/comments/:id)');
    });
});