import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {db} from "../db/db";
import {PostDbType} from "../types/db-types/post-db-type";
import {PostInputModel, PostViewModel} from "../types/input-output-types/posts-types";

const postsRepository = {
    getAllPosts(): PostViewModel[] {
        const allPosts: PostViewModel[] = db.posts
            .map(p => this.mapToViewModel({...p}));

        return allPosts;
    },
    getPostById(postId: string): PostViewModel | undefined {
        const foundPost: PostDbType | undefined = this.findPostToDb(postId);

        if (foundPost) {
            return this.mapToViewModel(foundPost);
        }

        return foundPost;
    },
    createNewPost(postData: PostInputModel): PostViewModel {
        // const newPost: PostDbType = {
        //     id: String(Math.floor(Date.now() + Math.random())),
        //     ...postData
        // };
        //
        // db.posts = [...db.posts, newPost];
        //
        // return this.mapToViewModel(newPost);
    },
    updateExistingPost(postId: string, postData: PostInputModel): boolean {
    //     const foundBlog: BlogDbType | undefined = this.findBlogToDb(blogId);
    //
    //     if (!foundBlog) return false;
    //
    //     const updatedBlog = {
    //         ...foundBlog,
    //         ...blogData
    //     };
    //
    //     db.blogs = db.blogs
    //         .map(b => b.id === updatedBlog.id ? updatedBlog : b);
    //
    //     return true;
    },
    deletePostById(blogId: string): boolean {
    //     const foundBlog: BlogDbType | undefined = this.findBlogToDb(blogId);
    //
    //     if (!foundBlog) return false;
    //
    //     db.blogs = db.blogs.filter(b => b.id !== blogId);
    //
    //     return true;
    },
    mapToViewModel(post: PostDbType): PostViewModel {
        const postForOutput: PostViewModel = {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName
        };

        return postForOutput;
    },
    findPostToDb(postId: string): PostDbType | undefined {
        return db.posts
            .find(p => p.id === postId);
    }
};

export {postsRepository};