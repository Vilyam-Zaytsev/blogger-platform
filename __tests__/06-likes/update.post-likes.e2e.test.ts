import {clearPresets, presets, userPropertyMap} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {Response} from "supertest";
import {console_log_e2e, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import mongoose from "mongoose";
import {LikeStatus} from "../../src/07-likes/like-entity";
import {LikesRepository} from "../../src/07-likes/repositoryes/likes-repository";
import {container} from "../../src/composition-root";
import {PostViewModel} from "../../src/05-posts/domain/post-entity";
import {UserViewModel} from "../../src/03-users/types/input-output-types";
import {SortDirection} from "../../src/common/helpers/sort-query-dto";
import {commentsTestManager} from "../helpers/managers/06_comments-test-manager";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {CommentViewModel} from "../../src/06-comments/domain/comment-entity";

const likeRepository: LikesRepository = container.get(LikesRepository);

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

describe('PUT /posts/:id/likeStatus', () => {

    it('should update the user\'s "like" reaction and increase the number of similar reactions(№1).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resPutLikes: Response = await req
            .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Like
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        //The 'myStatus' field must be 'None' because the user requesting the comment is not authenticated.
        //The 'newestLikes' field should contain information about one like.
        const foundPost_1: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id);

        expect(foundPost_1.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
            newestLikes: [
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: presets.users[0].id,
                    login: presets.users[0].login
                }
            ]
        });

        // The 'myStatus' field must be 'Like' because the user requesting the comment is authenticated.
        //The 'newestLikes' field should contain information about one like.
        const foundPost_2: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id, presets.authTokens[0].accessToken);

        expect(foundPost_2.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: LikeStatus.Like,
            newestLikes: [
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: presets.users[0].id,
                    login: presets.users[0].login
                }
            ]
        });

        console_log_e2e(resPutLikes.body, resPutLikes.status, 'Test 1: put(/posts/:id/likeStatus)');
    });

    it('should update the user\'s "like" reaction and increase the number of similar reactions(№2).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(2);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resPutLikes: Response[] = [];

        for (let i = 0; i < presets.users.length; i++) {

            const res: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
                .set(
                    'Authorization',
                    `Bearer ${presets.authTokens[i].accessToken}`
                )
                .send({
                    likeStatus: LikeStatus.Like
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            resPutLikes.push(res);
        }

        //The 'myStatus' field must be 'None' because the user requesting the comment is not authenticated.
        //The 'newestLikes' field should contain information about two like.
        const foundPost_1: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id);

        const filter = {
            pageNumber: 1,
            pageSize: 10,
            sortBy: 'createdAt',
            sortDirection: SortDirection.Descending
        };

        const sortedUsers = usersTestManager
            .filterAndSort<UserViewModel>(
                presets.users,
                filter,
                userPropertyMap
            );

        expect(foundPost_1.extendedLikesInfo).toEqual({
            likesCount: 2,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
            newestLikes: [
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: sortedUsers[0].id,
                    login: sortedUsers[0].login
                },
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: sortedUsers[1].id,
                    login: sortedUsers[1].login
                }
            ]
        });

        // The 'myStatus' field must be 'Like' because the user requesting the comment is authenticated.
        //The 'newestLikes' field should contain information about two like.
        for (let i = 0; i < presets.users.length; i++) {

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id, presets.authTokens[i].accessToken);

            expect(foundPost.extendedLikesInfo).toEqual({
                likesCount: 2,
                dislikesCount: 0,
                myStatus: LikeStatus.Like,
                newestLikes: [
                    {
                        addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        userId: sortedUsers[0].id,
                        login: sortedUsers[0].login
                    },
                    {
                        addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        userId: sortedUsers[1].id,
                        login: sortedUsers[1].login
                    }
                ]
            });
        }

        console_log_e2e(resPutLikes[0].body, resPutLikes[0].status, 'Test 2: put(/post/:id/likeStatus)');
    }, 10000);

    it('should update the user\'s "like" reaction and increase the number of similar reactions(№3).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(3);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resPutLikes: Response[] = [];

        for (let i = 0; i < presets.users.length; i++) {

            const res: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
                .set(
                    'Authorization',
                    `Bearer ${presets.authTokens[i].accessToken}`
                )
                .send({
                    likeStatus: LikeStatus.Like
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            resPutLikes.push(res);
        }

        //The 'myStatus' field must be 'None' because the user requesting the comment is not authenticated.
        //The 'newestLikes' field should contain information about three like.
        const foundPost_1: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id);

        const filter = {
            pageNumber: 1,
            pageSize: 10,
            sortBy: 'createdAt',
            sortDirection: SortDirection.Descending
        };

        const sortedUsers = usersTestManager
            .filterAndSort<UserViewModel>(
                presets.users,
                filter,
                userPropertyMap
            );

        expect(foundPost_1.extendedLikesInfo).toEqual({
            likesCount: 3,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
            newestLikes: [
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: sortedUsers[0].id,
                    login: sortedUsers[0].login
                },
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: sortedUsers[1].id,
                    login: sortedUsers[1].login
                },
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: sortedUsers[2].id,
                    login: sortedUsers[2].login
                }
            ]
        });

        // The 'myStatus' field must be 'Like' because the user requesting the comment is authenticated.
        //The 'newestLikes' field should contain information about three like.
        for (let i = 0; i < presets.users.length; i++) {

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id, presets.authTokens[i].accessToken);

            expect(foundPost.extendedLikesInfo).toEqual({
                likesCount: 3,
                dislikesCount: 0,
                myStatus: LikeStatus.Like,
                newestLikes: [
                    {
                        addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        userId: sortedUsers[0].id,
                        login: sortedUsers[0].login
                    },
                    {
                        addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        userId: sortedUsers[1].id,
                        login: sortedUsers[1].login
                    },
                    {
                        addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        userId: sortedUsers[2].id,
                        login: sortedUsers[2].login
                    }
                ]
            });
        }

        console_log_e2e(resPutLikes[0].body, resPutLikes[0].status, 'Test 3: put(/post/:id/likeStatus)');
    }, 10000);

    it('should update the user\'s "like" reaction and increase the number of similar reactions(№4).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(4);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resPutLikes: Response[] = [];

        for (let i = 0; i < presets.users.length; i++) {

            const res: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
                .set(
                    'Authorization',
                    `Bearer ${presets.authTokens[i].accessToken}`
                )
                .send({
                    likeStatus: LikeStatus.Like
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            resPutLikes.push(res);
        }

        //The 'myStatus' field must be 'None' because the user requesting the comment is not authenticated.
        //The 'newestLikes' field should contain information about three like.
        const foundPost_1: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id);

        const filter = {
            pageNumber: 1,
            pageSize: 10,
            sortBy: 'createdAt',
            sortDirection: SortDirection.Descending
        };

        const sortedUsers = usersTestManager
            .filterAndSort<UserViewModel>(
                presets.users,
                filter,
                userPropertyMap
            );

        expect(foundPost_1.extendedLikesInfo).toEqual({
            likesCount: 4,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
            newestLikes: [
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: sortedUsers[0].id,
                    login: sortedUsers[0].login
                },
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: sortedUsers[1].id,
                    login: sortedUsers[1].login
                },
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: sortedUsers[2].id,
                    login: sortedUsers[2].login
                }
            ]
        });

        // The 'myStatus' field must be 'Like' because the user requesting the comment is authenticated.
        //The 'newestLikes' field should contain information about three like.
        for (let i = 0; i < presets.users.length; i++) {

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id, presets.authTokens[i].accessToken);

            expect(foundPost.extendedLikesInfo).toEqual({
                likesCount: 4,
                dislikesCount: 0,
                myStatus: LikeStatus.Like,
                newestLikes: [
                    {
                        addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        userId: sortedUsers[0].id,
                        login: sortedUsers[0].login
                    },
                    {
                        addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        userId: sortedUsers[1].id,
                        login: sortedUsers[1].login
                    },
                    {
                        addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                        userId: sortedUsers[2].id,
                        login: sortedUsers[2].login
                    }
                ]
            });
        }

        console_log_e2e(resPutLikes[0].body, resPutLikes[0].status, 'Test 4: put(/post/:id/likeStatus)');
    }, 10000);

    it('should update the user\'s "dislike" reaction and increase the number of similar reactions(№1).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resPutLikes: Response = await req
            .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Dislike
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        //The 'myStatus' field must be 'None' because the user requesting the comment is not authenticated.
        const foundPost_1: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id);

        expect(foundPost_1.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: LikeStatus.None,
            newestLikes: []
        });

        // The 'myStatus' field must be 'Dislike' because the user requesting the comment is authenticated.
        const foundPost_2: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id, presets.authTokens[0].accessToken);

        expect(foundPost_2.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: LikeStatus.Dislike,
            newestLikes: []
        });

        console_log_e2e(resPutLikes.body, resPutLikes.status, 'Test 5: put(/posts/:id/likeStatus)');
    });

    it('should update the user\'s "dislike" reaction and increase the number of similar reactions(№2).', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(2);

        await authTestManager
            .login(presets.users.map(u => u.login));

        const resPutLikes: Response[] = [];

        for (let i = 0; i < presets.users.length; i++) {

            const res: Response = await req
                .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
                .set(
                    'Authorization',
                    `Bearer ${presets.authTokens[i].accessToken}`
                )
                .send({
                    likeStatus: LikeStatus.Dislike
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            resPutLikes.push(res);
        }

        //The 'myStatus' field must be 'None' because the user requesting the comment is not authenticated.
        const foundPost_1: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id);

        expect(foundPost_1.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 2,
            myStatus: LikeStatus.None,
            newestLikes: []
        });

        // The 'myStatus' field must be 'Dislike' because the user requesting the comment is authenticated.
        for (let i = 0; i < presets.users.length; i++) {

            const foundPost: PostViewModel = await postsTestManager
                .getPost(presets.posts[0].id, presets.authTokens[i].accessToken);

            expect(foundPost.extendedLikesInfo).toEqual({
                likesCount: 0,
                dislikesCount: 2,
                myStatus: LikeStatus.Dislike,
                newestLikes: []
            });
        }

        console_log_e2e(resPutLikes[0].body, resPutLikes[0].status, 'Test 6: put(/post/:id/likeStatus)');
    }, 10000);

    it('should update "None" to "Like", "Like" to "Dislike", "Dislike to "Like", "Like" to "None".', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(1);

        await authTestManager
            .login(presets.users.map(u => u.login));

        //None to Like
        const resPutLikes_1: Response = await req
            .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Like
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundPost_1: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id, presets.authTokens[0].accessToken);

        expect(foundPost_1.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: LikeStatus.Like,
            newestLikes: [
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: presets.users[0].id,
                    login: presets.users[0].login
                }
            ]
        });

        // Like to Dislike
        const resPutLikes_2: Response = await req
            .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Dislike
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundPost_2: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id, presets.authTokens[0].accessToken);

        expect(foundPost_2.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: LikeStatus.Dislike,
            newestLikes: []
        });

        //Dislike to Like
        const resPutLikes_3: Response = await req
            .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Like
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundPost_3: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id, presets.authTokens[0].accessToken);

        expect(foundPost_3.extendedLikesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: LikeStatus.Like,
            newestLikes: [
                {
                    addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                    userId: presets.users[0].id,
                    login: presets.users[0].login
                }
            ]
        });

        //Like to None
        const resPutLikes_4: Response = await req
            .put(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.None
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundPost_4: PostViewModel = await postsTestManager
            .getPost(presets.posts[0].id, presets.authTokens[0].accessToken);

        expect(foundPost_4.extendedLikesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
            newestLikes: []
        });

        console_log_e2e(resPutLikes_1.body, resPutLikes_1.status, 'Test 7: put(/post/:id/likeStatus)');
    }, 10000);

    it('---------------------------', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(10);

        await usersTestManager
            .createUser(2);

        await authTestManager
            .login(presets.users.map(u => u.login));

        for (let i = 0; i < presets.users.length; i++) {

            for (let j = 0; j < presets.posts.length; j++) {

                if (presets.users.length / 2 > i) {

                    if (presets.posts.length / 2 > j) {

                        await req
                            .put(`${SETTINGS.PATH.POSTS}/${presets.posts[j].id}${SETTINGS.PATH.LIKE_STATUS}`)
                            .set(
                                'Authorization',
                                `Bearer ${presets.authTokens[i].accessToken}`
                            )
                            .send({
                                likeStatus: LikeStatus.Like
                            })
                            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
                    } else {

                        await req
                            .put(`${SETTINGS.PATH.POSTS}/${presets.posts[j].id}${SETTINGS.PATH.LIKE_STATUS}`)
                            .set(
                                'Authorization',
                                `Bearer ${presets.authTokens[i].accessToken}`
                            )
                            .send({
                                likeStatus: LikeStatus.Dislike
                            })
                            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
                    }
                } else {

                    if (presets.posts.length / 2 > j) {

                        await req
                            .put(`${SETTINGS.PATH.POSTS}/${presets.posts[j].id}${SETTINGS.PATH.LIKE_STATUS}`)
                            .set(
                                'Authorization',
                                `Bearer ${presets.authTokens[i].accessToken}`
                            )
                            .send({
                                likeStatus: LikeStatus.Dislike
                            })
                            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
                    } else {

                        await req
                            .put(`${SETTINGS.PATH.POSTS}/${presets.posts[j].id}${SETTINGS.PATH.LIKE_STATUS}`)
                            .set(
                                'Authorization',
                                `Bearer ${presets.authTokens[i].accessToken}`
                            )
                            .send({
                                likeStatus: LikeStatus.Like
                            })
                            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
                    }
                }
            }
        }

        //The first five posts after 'myStatus' should have 'Dislike', the second half after 'myStatus' should have 'Like'.
        const foundPosts_1: Paginator<PostViewModel> = await postsTestManager
            .getPosts(presets.authTokens[0].accessToken);

        for (let i = 0; i < foundPosts_1.items.length; i++) {

            if (foundPosts_1.items.length / 2 > i) {

                expect(foundPosts_1.items[i].extendedLikesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.Dislike,
                    newestLikes: [
                        {
                            addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                            userId: presets.users[1].id,
                            login: presets.users[1].login
                        }
                    ]
                });
            }
            else {

                expect(foundPosts_1.items[i].extendedLikesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.Like,
                    newestLikes: [
                        {
                            addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                            userId: presets.users[0].id,
                            login: presets.users[0].login
                        }
                    ]
                });
            }
        }

        //The first five posts after 'myStatus' should have 'Like', the second half after 'myStatus' should have 'Dislike'.
        const foundPosts_2: Paginator<PostViewModel> = await postsTestManager
            .getPosts(presets.authTokens[1].accessToken);

        for (let i = 0; i < foundPosts_2.items.length; i++) {

            if (foundPosts_2.items.length / 2 > i) {

                expect(foundPosts_2.items[i].extendedLikesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.Like,
                    newestLikes: [
                        {
                            addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                            userId: presets.users[1].id,
                            login: presets.users[1].login
                        }
                    ]
                });
            } else {

                expect(foundPosts_2.items[i].extendedLikesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.Dislike,
                    newestLikes: [
                        {
                            addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                            userId: presets.users[0].id,
                            login: presets.users[0].login
                        }
                    ]
                });
            }
        }

        //All posts after 'myStatus' should have 'None'.
        const foundPosts_3: Paginator<PostViewModel> = await postsTestManager
            .getPosts();

        for (let i = 0; i < foundPosts_3.items.length; i++) {

            if (foundPosts_3.items.length / 2 > i) {

                expect(foundPosts_3.items[i].extendedLikesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.None,
                    newestLikes: [
                        {
                            addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                            userId: presets.users[1].id,
                            login: presets.users[1].login
                        }
                    ]
                });
            } else {

                expect(foundPosts_3.items[i].extendedLikesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.None,
                    newestLikes: [
                        {
                            addedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                            userId: presets.users[0].id,
                            login: presets.users[0].login
                        }
                    ]
                });
            }
        }

        console_log_e2e({}, 0, 'Test 8: put(/post/:id/likeStatus)');
    }, 25000);
});