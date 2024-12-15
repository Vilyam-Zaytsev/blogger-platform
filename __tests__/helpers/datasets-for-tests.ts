import {DBType} from "../../src/types/db-types/db-type";
import {BlogDbType} from "../../src/types/db-types/blog-db-type";

const blog_one: BlogDbType = {
    id: String(Math.floor(new Date().getTime())),
    name: 'BLOG_ONE',
    description: 'DESCRIPTION_ONE',
    websiteUrl: 'https://blog-one.com'
} as const;

const blog_two: BlogDbType = {
    id: String(Math.floor(new Date().getTime())),
    name: 'BLOG_TWO',
    description: 'DESCRIPTION_TWO',
    websiteUrl: 'https://blog-two.com'
} as const;

const dbTest_one: DBType = {
    blogs: [blog_one],
    posts: []
} as const;

const dbTest_two: DBType = {
    blogs: [blog_one, blog_two],
    posts: []
} as const;

export {
    blog_one,
    blog_two,
    dbTest_one,
    dbTest_two
}