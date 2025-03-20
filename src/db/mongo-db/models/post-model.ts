import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {PostDbType} from "../../../06-posts/types/post-db-type";

type PostModel = Model<PostDbType>;
type PostDocument = HydratedDocument<PostDbType>;

const postSchema = new Schema<PostDbType>({
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

const PostModel: PostModel = mongoose.model<PostDbType, PostModel>('Post', postSchema);

export {
    PostModel,
    PostDocument
};