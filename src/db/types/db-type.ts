import {BlogDbType} from "./blog-db-type";
import {PostDbType} from "./post-db-type";

type DBType = {
    blogs: BlogDbType[],
    posts: PostDbType[]
};

export {DBType};