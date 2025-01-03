import {BlogViewModel} from "../types/input-output-types/blogs-types";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {ObjectId, WithId} from "mongodb";
import {PaginationResponse} from "../types/input-output-types/pagination-types";
import {qBlogsRepository} from "../repositoryes/qBlogs-repository";
import {sortQueryFilterType} from "../types/input-output-types/sort-query-filter-types";

const qBlogsService = {
    async findBlogs(sortQueryDto: sortQueryFilterType): Promise<PaginationResponse<BlogDbType>> {
        const {
            pageNumber  ,
            pageSize    ,
            searchNameTerm
        } = sortQueryDto;

        const blogs: WithId<BlogDbType>[] = await qBlogsRepository
            .findBlogs(sortQueryDto);

        const blogsCount: number = await qBlogsRepository
            .getBlogsCount(searchNameTerm);

        return {
            pageCount: Math.ceil(blogsCount / pageSize),
            page: pageNumber,
            pageSize,
            totalCount: blogsCount,
            items: blogs.map(b => this.mapToViewModel(b)),
        };
    },
    async findBlog(id: string | ObjectId): Promise<BlogViewModel | null> {

        const foundBlog: WithId<BlogDbType> | null = await qBlogsRepository
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

export {qBlogsService};