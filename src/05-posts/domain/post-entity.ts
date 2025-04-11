import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {PostDto} from "./post-dto";
import {LikeStatus} from "../../07-likes/like-entity";
import {Reactions, reactionsSchema} from "../../common/reactions-schema";
import {updateReactionsCount} from "../../common/helpers/common-entity-methods";

type Post = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    reactions: Reactions,
    createdAt: string
};

type PostInputModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
};

type LikeDetailsViewModel = {
    addedAt: string,
    userId: string,
    login: string
};

type ExtendedLikesInfoViewModel = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
    newestLikes: LikeDetailsViewModel[]
};

type PostViewModel = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    extendedLikesInfo: ExtendedLikesInfoViewModel,
    createdAt: string
};

type PostMethods = typeof postMethods;
type PostStatics = typeof postStatics;

type PostModel = Model<Post, {}, PostMethods> & PostStatics;
type PostDocument = HydratedDocument<Post, PostMethods>;

const postSchema = new Schema<Post, PostModel>({

    title: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    blogId: {
        type: String,
        required: true
    },
    blogName: {
        type: String,
        required: true
    },
    reactions: {
        type: reactionsSchema,
        required: true
    },
    createdAt: {
        type: String,
        required: true
    }
});

const postMethods = {

    updateReactionsCount
};

const postStatics: any = {

    createPost(postDto: PostDto, blogName: string): PostDocument {

        const {
            title,
            shortDescription,
            content,
            blogId
        } = postDto;

        const createdAt: string = new Date().toISOString();

        const post: Post = {
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            reactions: {
                likeCount: 0,
                dislikeCount: 0,
            },
            createdAt
        };

        return new PostModel(post) as PostDocument;
    }
};

postSchema.methods = postMethods;
postSchema.statics = postStatics;

const PostModel: PostModel = mongoose.model<Post, PostModel>('Post', postSchema);

export {
    Post,
    PostViewModel,
    PostInputModel,
    PostModel,
    PostDocument
};