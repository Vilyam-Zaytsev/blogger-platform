import {BlogDbType} from "../../src/types/db-types/blog-db-type";
import {PostDbType} from "../../src/types/db-types/post-db-type";
import {UserDbType} from "../../src/types/db-types/user-db-type";

const blog: BlogDbType = {
    name: 'BLOG',
    description: 'DESCRIPTION',
    websiteUrl: 'https://blogs.com',
    createdAt: new Date().toISOString(),
    isMembership: false
} as const;

const post: PostDbType = {
    title: 'POST',
    shortDescription: 'SHORT_DESCRIPTION_POST',
    content: 'CONTENT_POST',
    blogId: '',
    blogName: blog.name,
    createdAt: new Date().toISOString(),
} as const;

const user: UserDbType = {
    login: 'user',
    email: '@example.com',
    passwordHash: 'hash',
    createdAt: new Date().toISOString(),
} as const;

export {
    blog,
    post,
    user
}