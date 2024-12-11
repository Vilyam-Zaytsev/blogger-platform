import {BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {db} from "../db/db";

const blogsRepository = {
    getAllBlogs(): BlogViewModel[] {
        const allBlogs: BlogViewModel[] = db.blogs
            .map(b => this.mapToViewModel({...b}));

        return allBlogs;
    },
    getBlogById(blogId: string): BlogViewModel | undefined {
        const foundBlog: BlogDbType | undefined = db.blogs
            .find(b => b.id === blogId);

        if (foundBlog) {
            return this.mapToViewModel(foundBlog);
        }

        return foundBlog;
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