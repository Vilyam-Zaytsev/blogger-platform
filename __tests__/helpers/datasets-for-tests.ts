import {DBType} from "../../src/types/db-types/db-type";
import {BlogDbType} from "../../src/types/db-types/blog-db-type";

const blog1: BlogDbType = {
    id: String(Math.floor(new Date().getTime())),
    name: 'blog1',
    description: 'description1',
    websiteUrl: 'https://blog1.com'
} as const;

const blog2: BlogDbType = {
    id: String(Math.floor(new Date().getTime())),
    name: 'blog2',
    description: 'description2',
    websiteUrl: 'https://blog2.com'
} as const;

const dbTest1: DBType = {
    blogs: [blog1],
    posts: []
} as const;

const dbTest2: DBType = {
    blogs: [],
    posts: []
} as const;

export {
    blog1,
    blog2,
    dbTest1,
    dbTest2
}