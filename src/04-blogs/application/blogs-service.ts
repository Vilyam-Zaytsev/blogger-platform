import {BlogsRepository} from "../repositoryes/blogs-repository";
import {BlogPostInputModel} from "../types/input-output-types";
import {ResultType} from "../../common/types/result-types/result-type";
import {ObjectId} from "mongodb";
import {ResultStatus} from "../../common/types/result-types/result-status";
import {PostsService} from "../../05-posts/application/posts-service";
import {BadRequestResult, NotFoundResult, SuccessResult} from "../../common/helpers/result-object";
import {injectable} from "inversify";
import {BlogDto} from "../domain/blog-dto";
import {Blog, BlogDocument, BlogModel} from "../domain/blog-entity";
import {PostDto} from "../../05-posts/domain/post-dto";

@injectable()
class BlogsService {

    constructor(
        private blogsRepository: BlogsRepository,
        private postsService: PostsService
    ) {};

    async createBlog(blogDto: BlogDto): Promise<string> {

        const blogDocument: BlogDocument = BlogModel.createBlog(blogDto);

        return await this.blogsRepository
            .saveBlog(blogDocument);
    }

    async createPost(postDto: PostDto): Promise<ResultType<string | null>> {

        const {blogId} = postDto;

        const resultCheckBlogId: ResultType = await this.checkBlogId(blogId);

        if (resultCheckBlogId.status !== ResultStatus.Success) {

            return NotFoundResult
                .create(
                    'blogId',
                    'There is no blog with this ID.',
                    'Couldn\'t create a new post entry.'
                )
        }

        const postCreationResult: string = await this.postsService
            .createPost(postDto);

        return SuccessResult
            .create<string>(postCreationResult);
    }

    async updateBlog(id: string, blogDto: BlogDto): Promise<boolean> {

        return await this.blogsRepository
            .updateBlog(id, blogDto);
    }

    async deleteBlog(id: string): Promise<boolean> {

        return await this.blogsRepository
            .deleteBlog(id);
    }

    async checkBlogId(blogId: string): Promise<ResultType> {

        if (!ObjectId.isValid(blogId)) {

            return BadRequestResult
                .create(
                    'blogId',
                    'Invalid ID format: The provided post ID is not a valid MongoDB ObjectId.',
                    'The BlogId field failed verification'
                );
        }

        const isExistBlog: BlogDocument | null = await this.blogsRepository
            .findBlog(blogId);

        if (!isExistBlog) {

            return NotFoundResult
                .create(
                    'blogId',
                    'There is no blog with this ID.',
                    'The BlogId field failed verification'
                );
        }

        return SuccessResult
            .create(null);
    }
}

export {BlogsService};