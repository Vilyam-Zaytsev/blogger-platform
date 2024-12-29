import {PostDbType} from "../types/db-types/post-db-type";
import {PostInputModel} from "../types/input-output-types/posts-types";
import {InsertOneResult, WithId} from "mongodb";
import {qBlogsRepository} from "../repositoryes/qBlogs-repository";
import {postsRepository} from "../repositoryes/posts-repository";
import {PaginationResponse} from "../types/input-output-types/pagination-types";
import {qPostsRepository} from "../repositoryes/qPosts-repository";

const postsService = {
    async findPosts(
        pageNumber: number,
        pageSize: number,
        sortBy: string,
        sortDirection: 'asc' | 'desc'
    ): Promise<PaginationResponse<PostDbType>>{
        const posts: WithId<PostDbType>[] = await postsRepository
            .findPosts(
                pageNumber,
                pageSize,
                sortBy,
                sortDirection
            );

        const postsCount: number = await postsRepository.getPostsCount();

        return {
            pageCount: Math.ceil(postsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: postsCount,
            items: posts.map(p => qPostsRepository.mapToViewModel(p))
        };
    },
    async createPost(data: PostInputModel): Promise<InsertOneResult> {
        const newPost: PostDbType = {
            ...data,
            blogName: (await qBlogsRepository.findBlog(data.blogId))!.name,
            createdAt: new Date().toISOString(),
        }

        return await postsRepository
            .createPost(newPost);
    },
    async updatePost(id: string, data: PostInputModel): Promise<boolean> {
        return await postsRepository
            .updatePost(id, data);
    },
    async deletePost(id: string): Promise<boolean> {
        return await postsRepository
            .deletePost(id);
    },
};

export {postsService};