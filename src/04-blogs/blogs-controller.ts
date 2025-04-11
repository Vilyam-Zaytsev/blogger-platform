import {Response} from "express";
import {BlogInputModel, BlogPostInputModel, BlogViewModel} from "./types/input-output-types";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../common/types/input-output-types/request-types";
import {SETTINGS} from "../common/settings";
import {BlogsService} from "./application/blogs-service";
import {Paginator,} from "../common/types/input-output-types/pagination-sort-types";
import {IdType} from "../common/types/input-output-types/id-type";
import {BlogsQueryRepository} from "./repositoryes/blogs-query-repository";
import {ResultType} from "../common/types/result-types/result-type";
import {ResultStatus} from "../common/types/result-types/result-status";
import {mapResultStatusToHttpStatus} from "../common/helpers/map-result-status-to-http-status";
import {PostsQueryRepository} from "../05-posts/repositoryes/posts-query-repository";
import {injectable} from "inversify";
import {SortingAndPaginationParamsType, SortQueryDto} from "../common/helpers/sort-query-dto";
import {BlogDto} from "./domain/blog-dto";
import {Blog} from "./domain/blog-entity";
import {PostDto} from "../05-posts/domain/post-dto";
import {isSuccessfulResult} from "../common/helpers/type-guards";
import {PostViewModel} from "../05-posts/domain/post-entity";

@injectable()
class BlogsController {

    constructor(
        private blogsService: BlogsService,
        private blogsQueryRepository: BlogsQueryRepository,
        private postsQueryRepository: PostsQueryRepository
    ) {};

    async getBlogs(
        req: RequestWithQuery<SortingAndPaginationParamsType>,
        res: Response<Paginator<Blog>>
    ){

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
            searchNameTerm: req.query.searchNameTerm
        };

        const sortQueryDto: SortQueryDto = new SortQueryDto(sortingAndPaginationParams);

        const foundBlogs: BlogViewModel[] = await this.blogsQueryRepository
            .findBlogs(sortQueryDto);

        const blogsCount: number = await this.blogsQueryRepository
            .getBlogsCount(sortQueryDto.searchNameTerm);

        const paginationResponse: Paginator<BlogViewModel> = await this.blogsQueryRepository
            ._mapBlogsViewModelToPaginationResponse(
                foundBlogs,
                blogsCount,
                sortQueryDto
            );

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(paginationResponse);
    }

    async getBlog(
        req: RequestWithParams<IdType>,
        res: Response<BlogViewModel>
    ){

        const foundBlog: BlogViewModel | null = await this.blogsQueryRepository
            .findBlog(req.params.id);

        if (!foundBlog) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404)

            return;
        }

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(foundBlog);
    }

    async createBlog(
        req: RequestWithBody<BlogInputModel>,
        res: Response<BlogViewModel>
    ){

        const {
            name,
            description,
            websiteUrl
        } = req.body;

        const blogDto: BlogDto = new BlogDto(name, description, websiteUrl);

        //TODO: стоит ли както проверять создание блога!!!???
        const blogCreationResult: string = await this.blogsService
            .createBlog(blogDto);

        const createdBlog: BlogViewModel | null = await this.blogsQueryRepository
            .findBlog(blogCreationResult);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdBlog!);
    }

    async updateBlog(
        req: RequestWithParamsAndBody<IdType, BlogInputModel>,
        res: Response<BlogViewModel>
    ){

        const {
            name,
            description,
            websiteUrl
        } = req.body;

        const blogDto: BlogDto = new BlogDto(name, description, websiteUrl);

        const blogUpdateResult: boolean = await this.blogsService
            .updateBlog(req.params.id, blogDto);

        if (!blogUpdateResult) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }

    async deleteBlog(
        req: RequestWithParams<IdType>,
        res: Response
    ){

        const blogDeletionResult: boolean = await this.blogsService
            .deleteBlog(req.params.id);

        if (!blogDeletionResult) {

            res
                .sendStatus(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            return;
        }

        res
            .sendStatus(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    }

    async getPosts(
        req: RequestWithParamsAndQuery<IdType, SortingAndPaginationParamsType>,
        res: Response<Paginator<PostViewModel>>
    ){

        const { id: blogId } = req.params;

        const resultCheckBlogId: ResultType = await this.blogsService
            .checkBlogId(blogId);

        if (resultCheckBlogId.status !== ResultStatus.Success) {

            res
                .sendStatus(mapResultStatusToHttpStatus(resultCheckBlogId.status));

            return;
        }

        const sortingAndPaginationParams: SortingAndPaginationParamsType = {
            pageNumber: req.query.pageNumber,
            pageSize: req.query.pageSize,
            sortBy: req.query.sortBy,
            sortDirection: req.query.sortDirection,
        };

        const sortQueryDto: SortQueryDto = new SortQueryDto(sortingAndPaginationParams);

        const foundPosts: PostViewModel[] = await this.postsQueryRepository
            .findPosts(sortQueryDto, blogId);

        const postsCount: number = await this.postsQueryRepository
            .getPostsCount(blogId);

        const paginationResponse: Paginator<PostViewModel> = await this.postsQueryRepository
            ._mapPostsViewModelToPaginationResponse(
                foundPosts,
                postsCount,
                sortQueryDto
            );

        res
            .status(SETTINGS.HTTP_STATUSES.OK_200)
            .json(paginationResponse);
    }

    async createPost(
        req: RequestWithParamsAndBody<IdType, BlogPostInputModel>,
        res: Response<PostViewModel>
    ){

        const userId: string | null = req.user ? req.user.id : null;

        const blogId: string = req.params.id;

        const {
            title,
            shortDescription,
            content
        } = req.body;

        const postDto: PostDto = new PostDto(
            title,
            shortDescription,
            content,
            blogId
        );

        const {
            status: postCreationStatus,
            data: idCreatedPost
        }: ResultType<string | null> = await this.blogsService
            .createPost(postDto);

        if (!isSuccessfulResult(postCreationStatus, idCreatedPost)) {

            res
                .sendStatus(mapResultStatusToHttpStatus(postCreationStatus));

            return;
        }

        const createdPost: PostViewModel | null = await this.postsQueryRepository
            .findPost(idCreatedPost, userId);

        res
            .status(SETTINGS.HTTP_STATUSES.CREATED_201)
            .json(createdPost!)
    }
}

export {BlogsController};