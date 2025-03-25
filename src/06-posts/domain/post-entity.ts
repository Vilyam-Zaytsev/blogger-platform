import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {PostDto} from "./post-dto";

type Post = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string
};

type PostStatics = typeof postStatics;

type PostModel = Model<Post, {}> & PostStatics;
type PostDocument = HydratedDocument<Post>;

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
    createdAt: {
        type: String,
        required: true
    }
});

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
            createdAt
        };

        return new PostModel(post) as PostDocument;
    }
}

postSchema.statics = postStatics;

const PostModel: PostModel = mongoose.model<Post, PostModel>('Post', postSchema);

export {
    Post,
    PostModel,
    PostDocument
};