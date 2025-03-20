import {PostDbType} from "../types/post-db-type";
import {PostInputModel} from "../types/input-output-types";
import {WithId} from "mongodb";
import {PostsRepository} from "../repositoryes/posts-repository";
import {BlogsRepository} from "../../05-blogs/repositoryes/blogs-repository";
import {injectable} from "inversify";
import {PostDocument, PostModel} from "../../db/mongo-db/models/post-model";

@injectable()
class PostsService {

    constructor(
        private blogsRepository: BlogsRepository,
        private postsRepository: PostsRepository
    ) {};

    async findPost(id: string): Promise<WithId<PostDbType> | null> {

        return await this.postsRepository
            .findPost(id);
    }

    async createPost(data: PostInputModel): Promise<string> {

        const newPost: PostDbType = {
            ...data,
            blogName: (await this.blogsRepository.findBlog(data.blogId))!.name,
            createdAt: new Date().toISOString(),
        };

        const postDocument: PostDocument = new PostModel(newPost);

        const resultSavePost: PostDocument = await this.postsRepository
            .savePost(postDocument);

        return String(resultSavePost._id);
    }

    async updatePost(id: string, data: PostInputModel): Promise<boolean> {

        return await this.postsRepository
            .updatePost(id, data);
    }

    async deletePost(id: string): Promise<boolean> {

        return await this.postsRepository
            .deletePost(id);
    }
}

export {PostsService};