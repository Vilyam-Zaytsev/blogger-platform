import {BlogViewModel} from "../types/input-output-types";
import {BlogDbType} from "../types/blog-db-type";
import {WithId} from "mongodb";
import {PaginationAndSortFilterType, PaginationResponse} from "../../common/types/input-output-types/pagination-sort-types";
import {blogsQueryRepository} from "../repositoryes/blogs-query-repository";

const blogsQueryService = {
    async findBlogs(sortQueryDto: PaginationAndSortFilterType): Promise<PaginationResponse<BlogViewModel>> {

        const {
            pageNumber  ,
            pageSize    ,
            searchNameTerm
        } = sortQueryDto;

        const blogs: WithId<BlogDbType>[] = await blogsQueryRepository
            .findBlogs(sortQueryDto);

        const blogsCount: number = await blogsQueryRepository
            .getBlogsCount(searchNameTerm);

        return {
            pagesCount: Math.ceil(blogsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: blogsCount,
            items: blogs.map(b => this.mapToViewModel(b)),
        };
    },
    async findBlog(id: string): Promise<BlogViewModel | null> {

        const foundBlog: WithId<BlogDbType> | null = await blogsQueryRepository
            .findBlog(id);

        if (!foundBlog) return null;

        return this.mapToViewModel(foundBlog);
    },
    mapToViewModel(blog: WithId<BlogDbType>): BlogViewModel {
        return {
            id: String(blog._id),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        };
    },

};

export {blogsQueryService};