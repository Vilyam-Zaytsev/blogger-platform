import {DBType} from "../../src/types/db-types/db-type";
import {BlogDbType} from "../../src/types/db-types/blog-db-type";
import {ObjectId} from "mongodb";
import {PostDbType} from "../../src/types/db-types/post-db-type";

const blog_1: BlogDbType = {
    name: 'BLOG_ONE',
    description: 'DESCRIPTION_ONE',
    websiteUrl: 'https://blog-one.com',
    createdAt: new Date().toISOString(),
    isMembership: false
} as const;

const blog_2: BlogDbType = {
    name: 'BLOG_TWO',
    description: 'DESCRIPTION_TWO',
    websiteUrl: 'https://blog-two.com',
    createdAt: new Date().toISOString(),
    isMembership: false
} as const;

// const post_1: PostDbType = {
//     _id: new ObjectId(),
//     id: String(Math.floor(new Date().getTime())),
//     title: 'POST_ONE',
//     shortDescription: 'SHORT_DESCRIPTION_POST_ONE',
//     content: 'CONTENT_POST_ONE',
//     // blogId: blog_1._id,
//     blogName: blog_1.name,
//     createdAt: new Date().toISOString(),
// } as const;
//
// const post_2: PostDbType = {
//     _id: new ObjectId(),
//     id: String(Math.floor(new Date().getTime())),
//     title: 'POST_TWO',
//     shortDescription: 'SHORT_DESCRIPTION_POST_TWO',
//     content: 'CONTENT_POST_TWO',
//     blogId: blog_2.id,
//     blogName: blog_2.name,
//     createdAt: new Date().toISOString(),
// } as const;

const dbTest_1: DBType = {
    blogs: [blog_1],
    posts: []
} as const;

const dbTest_2: DBType = {
    blogs: [blog_1, blog_2],
    posts: []
} as const;

export {
    blog_1,
    blog_2,
    dbTest_1,
    dbTest_2
}