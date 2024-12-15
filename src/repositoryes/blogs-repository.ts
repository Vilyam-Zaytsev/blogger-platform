import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {db} from "../db/db";

const blogsRepository = {
    getAllBlogs(): BlogViewModel[] {
        const allBlogs: BlogViewModel[] = db.blogs
            .map(b => this.mapToViewModel({...b}));

        return allBlogs;
    },
    getBlogById(blogId: string): BlogViewModel | undefined {
        const foundBlog: BlogDbType | undefined = this.findBlogToDb(blogId);

        if (foundBlog) {
            return this.mapToViewModel(foundBlog);
        }

        return foundBlog;
    },
    createNewBlog(blogData: BlogInputModel): BlogViewModel {
        const newBlog: BlogDbType = {
            id: String(Math.floor(Date.now() + Math.random())),
            ...blogData
        };

        db.blogs = [...db.blogs, newBlog];

        return this.mapToViewModel(newBlog);
    },
    updateExistingBlog(blogId: string, blogData: BlogInputModel): boolean {
        const foundBlog: BlogDbType | undefined = this.findBlogToDb(blogId);

        if (!foundBlog) return false;

        const updatedBlog = {
            ...foundBlog,
            ...blogData
        };

        db.blogs = db.blogs
            .map(b => b.id === updatedBlog.id ? updatedBlog : b);

        return true;
    },
    deleteBlogById(blogId: string): boolean {
        const foundBlog: BlogDbType | undefined = this.findBlogToDb(blogId);

        if (!foundBlog) return false;

        db.blogs = db.blogs.filter(b => b.id !== blogId);

        return true;
    },
    mapToViewModel(blog: BlogDbType): BlogViewModel {
        const blogForOutput: BlogViewModel = {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl
        };

        return blogForOutput;
    },
    findBlogToDb(blogId: string): BlogDbType | undefined {
        return db.blogs
            .find(b => b.id === blogId);
    }
};

export {blogsRepository};