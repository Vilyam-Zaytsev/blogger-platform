import {BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {db} from "../db/db";

const blogsRepository = {
    getBlogs(): BlogViewModel[] {
        const allBlogs: BlogViewModel[] = db.blogs
            .map(b => this.mapToViewModel({...b}));

        return allBlogs;
    },
    mapToViewModel(blog: BlogDbType): BlogViewModel {
        const blogForOutput = {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl
        };

        return blogForOutput;
    },
};

export {blogsRepository};