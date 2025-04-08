import {ObjectId} from "mongodb";
import {clearPresets, comments, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {postsTestManager} from "../helpers/managers/05_posts-test-manager";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {Response} from "supertest";
import {console_log_e2e, generateRandomString, req} from "../helpers/test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {ApiErrorResult} from "../../src/common/types/input-output-types/api-error-result";
import {commentsTestManager} from "../helpers/managers/06_comments-test-manager";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import mongoose from "mongoose";
import {CommentViewModel} from "../../src/06-comments/domain/comment-entity";
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

    it('should not update the comment if the data in the request body is incorrect (the content field is less than 20 characters long).', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                content: generateRandomString(19)
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPutComment.body).toEqual<ApiErrorResult>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The length of the "content" field should be from 20 to 300.'
                }
            ]
        });

        const foundComment: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment).toEqual<CommentViewModel>(presets.comments[0]);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 5: put(/comments/:id)');
    });

    it('should not update the comment if the data in the request body is incorrect (the content field is more than 300 characters long).', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                content: generateRandomString(301)
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPutComment.body).toEqual<ApiErrorResult>({
            errorsMessages: [
                {
                    field: 'content',
                    message: 'The length of the "content" field should be from 20 to 300.'
                }
            ]
        });

        const foundComment: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment).toEqual<CommentViewModel>(presets.comments[0]);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 6: put(/comments/:id)');
    });

    it('should not update comments if the user in question is not the owner of the comment.', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[1].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.FORBIDDEN_403);

        await req
            .put(`${SETTINGS.PATH.COMMENTS}/${presets.comments[0].id}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 7: put(/comments/:id)');
    });

    it('should not update comments if the comment does not exist.', async () => {

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

        const resPutComment: Response = await req
            .put(`${SETTINGS.PATH.COMMENTS}/${new ObjectId()}`)
            .set(
                'Authorization',
                `Bearer ${presets.authTokens[0].accessToken}`
            )
            .send({
                content: comments[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

        const foundComment: CommentViewModel = await commentsTestManager
            .getComment(presets.comments[0].id);

        expect(foundComment).toEqual<CommentViewModel>(presets.comments[0]);

        console_log_e2e(resPutComment.body, resPutComment.status, 'Test 8: put(/comments/:id)');
    });
});