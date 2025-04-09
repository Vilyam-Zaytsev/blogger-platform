import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {Response} from "supertest";
import {console_log_e2e, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {commentsTestManager} from "../helpers/managers/06_comments-test-manager";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import mongoose from "mongoose";
import {CommentViewModel} from "../../src/06-comments/domain/comment-entity";
import {LikeStatus} from "../../src/07-likes/like-entity";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";

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

describe('PUT /comments/:id/likeStatus', () => {

    it('should update the user\'s "like" reaction and increase the number of similar reactions.', async () => {

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

        const resPutLikes: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Like
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        //The 'myStatus' field must be 'None' because the user requesting the comment is not authenticated.
        const foundComment_1: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment_1.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: LikeStatus.None
        });

        // The 'myStatus' field must be 'Like' because the user requesting the comment is authenticated.
        const foundComment_2: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id, presets.authTokens[0].accessToken);

        expect(foundComment_2.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: LikeStatus.Like
        });

        console_log_e2e(resPutLikes.body, resPutLikes.status, 'Test 1: put(/comments/:id/likeStatus)');
    });

    it('should update the user\'s "dislike" reaction and increase the number of similar reactions.', async () => {

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

        const resPutLikes: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Dislike
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        //The 'myStatus' field must be 'None' because the user requesting the comment is not authenticated.
        const foundComment_1: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment_1.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: LikeStatus.None
        });

        // The 'myStatus' field must be 'Like' because the user requesting the comment is authenticated.
        const foundComment_2: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id, presets.authTokens[0].accessToken);

        expect(foundComment_2.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: LikeStatus.Dislike
        });

        console_log_e2e(resPutLikes.body, resPutLikes.status, 'Test 2: put(/comments/:id/likeStatus)');
    });

    it('one user should set the reaction to \'Like\', the second to \'Dislike\', and the corresponding counters should also be disabled in the comment.).', async () => {

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

        const resPutLikes_1: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Like
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const resPutLikes_2: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[1].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Dislike
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        //The 'myStatus' field must be 'None' because the user requesting the comment is not authenticated.
        const foundComment_1: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment_1.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 1,
            myStatus: LikeStatus.None
        });

        // The "my status" field should have "Like" because the user requesting the comment has left a corresponding reaction.
        const foundComment_2: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id, presets.authTokens[0].accessToken);

        expect(foundComment_2.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 1,
            myStatus: LikeStatus.Like
        });

        // The "my status" field should have "Dislike" because the user requesting the comment has left a
        // corresponding reaction.
        const foundComment_3: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id, presets.authTokens[1].accessToken);

        expect(foundComment_3.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 1,
            myStatus: LikeStatus.Dislike
        });

        console_log_e2e(resPutLikes_1.body, resPutLikes_1.status, 'Test 3: put(/comments/:id/likeStatus)');
    }, 10000);

    it('should update "Like" to "Dislike", "Dislike to "Like", "Like" to "None".', async () => {

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

        //None to Like
        const resPutLikes_1 = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Like
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundComment_1: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id, presets.authTokens[0].accessToken);

        expect(foundComment_1.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: LikeStatus.Like
        });

        //Like to Dislike
        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Dislike
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundComment_2: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id, presets.authTokens[0].accessToken);

        expect(foundComment_2.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 1,
            myStatus: LikeStatus.Dislike
        });

        //Dislike to Like
        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.Like
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundComment_3: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id, presets.authTokens[0].accessToken);

        expect(foundComment_3.likesInfo).toEqual({
            likesCount: 1,
            dislikesCount: 0,
            myStatus: LikeStatus.Like
        });

        //Like to None
        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}${SETTINGS.PATH.LIKE_STATUS}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                likeStatus: LikeStatus.None
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundComment_4: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id, presets.authTokens[0].accessToken);

        expect(foundComment_4.likesInfo).toEqual({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikeStatus.None
        });

        console_log_e2e(resPutLikes_1.body, resPutLikes_1.status, 'Test 4: put(/comments/:id/likeStatus)');
    }, 10000);

    it('---------------------------', async () => {

        await blogsTestManager
            .createBlog(1);

        await postsTestManager
            .createPost(1);

        await usersTestManager
            .createUser(2);

        await authTestManager
            .login(presets.users.map(u => u.login));

        await commentsTestManager
            .createComments(10);

        for (let i = 0; i < presets.users.length; i++) {

            for (let j = 0; j < presets.comments.length; j++) {

                if (presets.users.length / 2 > i) {

                    if (presets.comments.length / 2 > j) {

                        await req
                            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[j].id}${SETTINGS.PATH.LIKE_STATUS}`)
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
                            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[j].id}${SETTINGS.PATH.LIKE_STATUS}`)
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

                    if (presets.comments.length / 2 > j) {

                        await req
                            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[j].id}${SETTINGS.PATH.LIKE_STATUS}`)
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
                            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[j].id}${SETTINGS.PATH.LIKE_STATUS}`)
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

        const foundComments_1: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id, presets.authTokens[0].accessToken);

        for (let i = 0; i < foundComments_1.items.length; i++) {

            if (foundComments_1.items.length / 2 > i) {

                expect(foundComments_1.items[i].likesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.Dislike
                });
            } else {

                expect(foundComments_1.items[i].likesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.Like
                });
            }
        }

        const foundComments_2: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id, presets.authTokens[1].accessToken);

        for (let i = 0; i < foundComments_2.items.length; i++) {

            if (foundComments_2.items.length / 2 > i) {

                expect(foundComments_2.items[i].likesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.Like
                });
            } else {

                expect(foundComments_2.items[i].likesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.Dislike
                });
            }
        }

        const foundComments_3: Paginator<CommentViewModel> = await commentsTestManager
            .getComments(presets.posts[0].id);

        for (let i = 0; i < foundComments_3.items.length; i++) {

                expect(foundComments_3.items[i].likesInfo).toEqual({
                    likesCount: 1,
                    dislikesCount: 1,
                    myStatus: LikeStatus.None
                });
        }

        console_log_e2e({}, 0, 'Test 5: put(/comments/:id/likeStatus)');
    }, 30000);
});