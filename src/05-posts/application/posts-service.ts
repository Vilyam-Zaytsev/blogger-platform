import {PostInputModel} from "../types/input-output-types";
import {WithId} from "mongodb";
import {PostsRepository} from "../repositoryes/posts-repository";
import {BlogsRepository} from "../../04-blogs/repositoryes/blogs-repository";
import {injectable} from "inversify";
import {PostDto} from "../domain/post-dto";
import {Post, PostDocument, PostModel} from "../domain/post-entity";

@injectable()
class PostsService {

    constructor(
        private blogsRepository: BlogsRepository,
        private postsRepository: PostsRepository
    ) {};

    async findPost(id: string): Promise<WithId<Post> | null> {

        return await this.postsRepository
            .findPost(id);
    }

    async createPost(postDto: PostDto): Promise<string> {

        const {blogId} = postDto;

        const blogName: string = (await this.blogsRepository.findBlog(blogId))!.name

        const postDocument: PostDocument = PostModel.createPost(postDto, blogName);

        return await this.postsRepository
            .savePost(postDocument);
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