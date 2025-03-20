import {BlogsRepository} from "../repositoryes/blogs-repository";
import {BlogInputModel, BlogPostInputModel} from "../types/input-output-types";
import {BlogDbType} from "../types/blog-db-type";
import {ResultType} from "../../common/types/result-types/result-type";
import {ObjectId} from "mongodb";
import {ResultStatus} from "../../common/types/result-types/result-status";
import {PostsService} from "../../06-posts/domain/posts-service";
import {
    BadRequestResult,
    InternalServerErrorResult,
    NotFoundResult,
    SuccessResult
} from "../../common/helpers/result-object";
import {injectable} from "inversify";
import {BlogDocument, BlogModel} from "../../db/mongo-db/models/blog-model";

@injectable()
class BlogsService {

    constructor(
        private blogsRepository: BlogsRepository,
        private postsService: PostsService
    ) {};

    async createBlog(blogData: BlogInputModel): Promise<string> {

        const newBlog: BlogDbType = {
            ...blogData,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };

        const blogDocument: BlogDocument = new BlogModel(newBlog);

        const resultSaveBlog =  await this.blogsRepository
            .saveBlog(blogDocument);

        return String(resultSaveBlog._id);
    }

    async createPost(
        blogId: string,
        dataForCreatingPost: BlogPostInputModel
    ): Promise<ResultType<string | null>> {

        const resultCheckBlogId: ResultType<string | null> = await this.checkBlogId(blogId);

        if (resultCheckBlogId.status !== ResultStatus.Success) {

            return NotFoundResult
                .create(
                    'blogId',
                    'There is no blog with this ID.',
                    'Couldn\'t create a new post entry.'
                )
        }

        const resultCreatedPost: string = await this.postsService
            .createPost({...dataForCreatingPost, blogId});

        return SuccessResult
            .create<string>(resultCreatedPost);
    }

    async updateBlog(id: string, data: BlogInputModel): Promise<boolean> {

        return await this.blogsRepository
            .updateBlog(id, data);
    }

    async deleteBlog(id: string): Promise<boolean> {

        return await this.blogsRepository
            .deleteBlog(id);
    }

    async checkBlogId(blogId: string): Promise<ResultType<string | null>> {

        if (!ObjectId.isValid(blogId)) {

            return BadRequestResult
                .create(
                    'blogId',
                    'Invalid ID format: The provided post ID is not a valid MongoDB ObjectId.',
                    'The BlogId field failed verification'
                );
        }

        const isExistBlog: BlogDbType | null = await this.blogsRepository
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
            .create<string>(blogId);
    }
}

export {BlogsService};