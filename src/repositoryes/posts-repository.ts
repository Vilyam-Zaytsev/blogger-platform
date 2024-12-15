import {BlogInputModel, BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {db} from "../db/db";
import {PostDbType} from "../types/db-types/post-db-type";
import {PostInputModel, PostViewModel} from "../types/input-output-types/posts-types";
import {blogsRepository} from "./blogs-repository";

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
        const newPost: PostDbType = {
            id: String(Math.floor(Date.now() + Math.random())),
            ...postData,
            blogName: blogsRepository.findBlogToDb(postData.blogId)!.name
        };

        db.posts = [...db.posts, newPost];

        return this.mapToViewModel(newPost);
    },
    updateExistingPost(postId: string, postData: PostInputModel): boolean {
        const foundPost: PostDbType | undefined = this.findPostToDb(postId);

        if (!foundPost) return false;

        const updatedPost = {
            ...foundPost,
            ...postData
        };

        db.posts = db.posts
            .map(p => p.id === updatedPost.id ? updatedPost : p);

        return true;
    },
    deletePostById(postId: string): boolean {
        const foundPost: PostDbType | undefined = this.findPostToDb(postId);

        if (!foundPost) return false;

        db.posts = db.posts.filter(p => p.id !== postId);

        return true;
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