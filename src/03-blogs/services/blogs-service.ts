import {blogsRepository} from "../repositoryes/blogs-repository";
import {BlogInputModel, BlogPostInputModel} from "../types/input-output-types";
import {BlogDbType} from "../types/blog-db-type";
import {ResultType} from "../../common/types/result-types/result-type";
import {ObjectId} from "mongodb";
import {ResultStatus} from "../../common/types/result-types/result-status";
import {postsService} from "../../04-posts/services/posts-service";

const blogsService = {

    async createBlog(blogData: BlogInputModel): Promise<string> {

        const newBlog: BlogDbType = {
            ...blogData,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };

        const resultInsertBlog =  await blogsRepository
            .insertBlog(newBlog);

        return String(resultInsertBlog.insertedId);
    },

    async createPost(
        blogId: string,
        dataForCreatingPost: BlogPostInputModel
    ): Promise<ResultType<string | null>> {

        const resultCheckBlogId: ResultType<string | null> = await this.checkBlogId(blogId);

        // TODO как правильно поступить если у меня возвращаются разные ошибки?

        if (resultCheckBlogId.status !== ResultStatus.Success) return {
            status: ResultStatus.NotFound,
            errorMessage: 'blog not found',
            extensions: [{
                field: 'blogId',
                message: 'There is no blog with this ID.'
            }],
            data: null
        };

        const resultCreatedPost: string = await postsService
            .createPost(dataForCreatingPost[blogId]);

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: resultCreatedPost
        };
    },

    async updateBlog(id: string, data: BlogInputModel): Promise<boolean> {

        return await blogsRepository
            .updateBlog(id, data);
    },

    async deleteBlog(id: string): Promise<boolean> {

        return await blogsRepository
            .deleteBlog(id);
    },

    async checkBlogId(blogId: string): Promise<ResultType<string | null>> {

        if (!ObjectId.isValid(blogId)) return {
            status: ResultStatus.BadRequest,
            errorMessage: 'blogId invalid',
            extensions: [{
                field: 'blogId',
                message: 'The passed BlogId is not a valid ObjectId.'
            }],
            data: null
        };

        const isExistBlog: BlogDbType | null = await blogsRepository
            .findBlog(blogId);

        if (!isExistBlog) return {
            status: ResultStatus.NotFound,
            errorMessage: 'blog not found',
            extensions: [{
                field: 'blogId',
                message: 'There is no blog with this ID.'
            }],
            data: null
        };

        return {
            status: ResultStatus.Success,
            extensions: [],
            data: blogId
        };
    }
};

export {blogsService};