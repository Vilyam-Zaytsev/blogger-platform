import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
import {BlogDto} from "./blog-dto";

type Blog = {
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
    isMembership: boolean
};

type BlogStatics = typeof blogStatics;

type BlogModel = Model<Blog, {}> & BlogStatics;
type BlogDocument = HydratedDocument<Blog>;

const blogSchema = new Schema<Blog, BlogModel>({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    websiteUrl: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        required: true
    },
    isMembership: {
        type: Boolean,
        default: false
    }
});

const blogStatics: any = {

    createBlog(blogDto: BlogDto): BlogDocument {

        const {
            name,
            description,
            websiteUrl
        } = blogDto;

        const createdAt: string = new Date().toISOString();

        const blog: Blog = {
            name,
            description,
            websiteUrl,
            createdAt,
            isMembership: false
        }

        return new BlogModel(blog) as BlogDocument;
    }
};

const BlogModel: BlogModel = mongoose.model<Blog, BlogModel>('Blog', blogSchema);

export {
    Blog,
    BlogModel,
    BlogDocument
};