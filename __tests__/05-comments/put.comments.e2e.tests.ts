import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {
    blogsCollection, commentsCollection, postsCollection,
    setBlogsCollection,
    setCommentsCollection,
    setPostsCollection,
    setUsersCollection, usersCollection
} from "../../src/db/mongoDb";
import {UserDbType} from "../../src/02-users/types/user-db-type";
import {BlogDbType} from "../../src/03-blogs/types/blog-db-type";
import {PostDbType} from "../../src/04-posts/types/post-db-type";
import {CommentDbType} from "../../src/05-comments/types/comment-db-type";
import {clearPresets, commentPropertyMap, comments, incorrectAccessToken, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/blogs-test-manager";
import {postsTestManager} from "../helpers/posts-test-manager";
import {usersTestManager} from "../helpers/users-test-manager";
import {authTestManager} from "../helpers/auth-test-manager";
import {Response} from "supertest";
import {console_log, generateRandomString, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {CommentViewModel} from "../../src/05-comments/types/input-output-types";
import {OutputErrorsType} from "../../src/common/types/input-output-types/output-errors-type";
import {PaginationResponse, SortDirection} from "../../src/common/types/input-output-types/pagination-sort-types";
import {commentsService} from "../../src/05-comments/comments-service";
import {commentsTestManager} from "../helpers/comments-test-manager";
import {createPaginationAndSortFilter} from "../../src/common/helpers/create-pagination-and-sort-filter";

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

describe('PUT /comments', () => {
    it('should update the comment if the user is logged in.', async () => {

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

        const resPutComments: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.accessTokens[0].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const resGetComment: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment.body).toEqual<CommentViewModel>({

            id: presets.comments[0].id,
            content: comments[1],
            commentatorInfo: {
                userId: presets.users[0].id,
                userLogin: presets.users[0].login
            },
            createdAt: presets.comments[0].createdAt
        })

        console_log(resPutComments.body, resPutComments.status, 'Test 1: put(/comments)');
    });
    it('should return an array with three comments.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(3);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        for (let i = 0; i < resGetComments.body.items.length; i++) {
            expect(resGetComments.body.items[i]).toEqual(
                commentsTestManager.filterAndSort(
                    presets.comments,
                    createPaginationAndSortFilter({
                        pageNumber: '1',
                        pageSize: '10',
                        sortBy: 'createdAt',
                        sortDirection: SortDirection.Descending
                    }),
                    commentPropertyMap
                )[i]
            );
        }

        expect(resGetComments.body.items.length).toEqual(3);

        console_log(resGetComments.body, resGetComments.status, 'Test 3: get(/comments)');
    });
    it('should return comment found by id.', async () => {

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

        const resGetComment = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment.body).toEqual(presets.comments[0])

        console_log(resGetComment.body, resGetComment.status, 'Test 4: getById(/comments)');
    });
    it('should return the 404 not found error (if the comment with this ID does not exist).', async () => {

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

        const resGetComment_1: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${new ObjectId()}`)
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const resGetComment_2: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetComment_2.body).toEqual(presets.comments[0])

        console_log(resGetComment_1.body, resGetComment_1.status, 'Test 5: getById(/comments)');
    });
});