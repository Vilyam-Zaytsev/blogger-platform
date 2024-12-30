import {DBType} from "../../src/types/db-types/db-type";
import {BlogDbType} from "../../src/types/db-types/blog-db-type";
import {ObjectId} from "mongodb";
import {PostDbType} from "../../src/types/db-types/post-db-type";

const blog: BlogDbType = {
    name: 'BLOG',
    description: 'DESCRIPTION',
    websiteUrl: 'https://blogs.com',
    createdAt: new Date().toISOString(),
    isMembership: false
} as const;

// const blog_2: BlogDbType = {
//     name: 'BLOG',
//     description: 'DESCRIPTION',
//     websiteUrl: 'https://blogs.com',
//     createdAt: new Date().toISOString(),
//     isMembership: false
// } as const;

// const post_1: PostDbType = {
//     title: 'POST',
//     shortDescription: 'SHORT_DESCRIPTION_POST',
//     content: 'CONTENT_POST',
//     blogId: '',
//     blogName: blog_1.name,
//     createdAt: new Date().toISOString(),
// } as const;
//
// const post_2: PostDbType = {
//     title: 'POST',
//     shortDescription: 'SHORT_DESCRIPTION_POST',
//     content: 'CONTENT_POST',
//     blogId: '',
//     blogName: blog_2.name,
//     createdAt: new Date().toISOString(),
// } as const;

// const dbTest_1: DBType = {
//     blogs: [blog_1],
//     posts: [post_1]
// } as const;

// const dbTest_2: DBType = {
//     blogs: [blog_1, blog_2],
//     posts: [post_1, post_2]
// } as const;

export {
    blog,
    // blog_2,
    // post_1,
    // post_2,
    // dbTest_1,
    // dbTest_2
}