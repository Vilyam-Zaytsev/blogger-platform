import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {
    blogsCollection,
    commentsCollection,
    postsCollection,
    usersCollection,
    setBlogsCollection,
    setCommentsCollection,
    setPostsCollection,
    setUsersCollection, sessionsCollection, apiTrafficCollection, setSessionsCollection, setApiTrafficCollection,
} from "../../src/db/mongo-db/mongoDb";
import {BlogDbType} from "../../src/05-blogs/types/blog-db-type";
import {PostDbType} from "../../src/06-posts/types/post-db-type";
import {CommentDbType} from "../../src/07-comments/types/comment-db-type";
import {
    clearPresets,
    commentPropertyMap,
    comments,
    presets,
} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {Response} from "supertest";
import {console_log_e2e, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {CommentViewModel} from "../../src/07-comments/types/input-output-types";
import {SortDirection} from "../../src/common/types/input-output-types/pagination-sort-types";
import {commentsTestManager} from "../helpers/managers/06_comments-test-manager";
import {createPaginationAndSortFilter} from "../../src/common/helpers/create-pagination-and-sort-filter";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";
import {ApiTrafficType} from "../../src/common/types/api-traffic-type";
import {User} from "../../src/04-users/domain/user-entity";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setUsersCollection(db.collection<User>('users'));
    setBlogsCollection(db.collection<BlogDbType>('blogs'));
    setPostsCollection(db.collection<PostDbType>('posts'));
    setCommentsCollection(db.collection<CommentDbType>('comments'));
    setSessionsCollection(db.collection<ActiveSessionType>('sessions'));
    setApiTrafficCollection(db.collection<ApiTrafficType>('api-traffic'));
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
    await sessionsCollection.deleteMany({});
    await apiTrafficCollection.deleteMany({});

    clearPresets();
});

describe('pagination and sort /comments', () => {

    it('should use default pagination values when none are provided by the client.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(11);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        for (let i = 0; i < resGetComments.body.items.length; i++) {
            expect(resGetComments.body.items[i]).toEqual(
                commentsTestManager.filterAndSort<CommentViewModel>(
                    [...presets.comments],
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

        expect(resGetComments.body.items.length).toEqual(10);

        expect(presets.comments.length).toEqual(11);

        console_log_e2e(resGetComments.body, resGetComments.status, 'Test 1: pagination and' +
            ' sort(/posts/{postId}/comments)');
    });

    it('should use client-provided pagination values to return the correct subset of data.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(5);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(11, 5);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .query({
                pageNumber: 2,
                pageSize: 3,
                sortBy: 'commentatorInfo.userLogin',
                sortDirection: SortDirection.Ascending,
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        for (let i = 0; i < resGetComments.body.items.length; i++) {
            expect(resGetComments.body.items[i]).toEqual(
                commentsTestManager.filterAndSort<CommentViewModel>(
                    [...presets.comments],
                    createPaginationAndSortFilter({
                        pageNumber: '2',
                        pageSize: '3',
                        sortBy: 'userLogin',
                        sortDirection: SortDirection.Ascending
                    }),
                    commentPropertyMap
                )[i]
            );
        }

        expect(resGetComments.body.items.length).toEqual(3);

        expect(presets.comments.length).toEqual(11);

        console_log_e2e(resGetComments.body, resGetComments.status, 'Test 2: pagination and sort(/posts/{postId}/comments)');
    });

    it('should return a 400 error if the client has passed invalid pagination values.', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(11);

        const resGetComments: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
            .query({
                pageNumber: 'xxx',
                pageSize: 'xxx',
                sortBy: 123,
                sortDirection: 'xxx',
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resGetComments.body).toEqual({
            errorsMessages: [
                {
                    field: 'pageNumber',
                    message: 'The "pageNumber" field must be a positive integer.'
                },
                {
                    field: 'pageSize',
                    message: 'The "pageSize" field must be a positive integer.'
                },
                {
                    field: 'sortDirection',
                    message: 'The "SortDirection" field must contain "asc" | "desc".'
                }
            ]
        })

        expect(presets.comments.length).toEqual(11);

        console_log_e2e(resGetComments.body, resGetComments.status, 'Test 3: pagination and sort(/posts/{postId}/comments)');
    });
});