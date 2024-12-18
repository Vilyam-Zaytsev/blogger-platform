import {DBType} from "../../src/types/db-types/db-type";
import {BlogDbType} from "../../src/types/db-types/blog-db-type";
import {ObjectId} from "mongodb";

const blog_1: BlogDbType = {
    _id: ObjectId,
    id: String(Math.floor(new Date().getTime())),
    name: 'BLOG_ONE',
    description: 'DESCRIPTION_ONE',
    websiteUrl: 'https://blog-one.com',
    createdAt: new Date().toISOString(),
    isMembership: false
} as const;

const blog_2: BlogDbType = {
    _id: ObjectId,
    id: String(Math.floor(new Date().getTime())),
    name: 'BLOG_TWO',
    description: 'DESCRIPTION_TWO',
    websiteUrl: 'https://blog-two.com',
    createdAt: new Date().toISOString(),
    isMembership: false
} as const;

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