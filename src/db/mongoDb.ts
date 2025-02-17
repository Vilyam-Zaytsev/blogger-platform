import {Collection, MongoClient} from "mongodb";
import {SETTINGS} from "../common/settings";
import {BlogDbType} from "../03-blogs/types/blog-db-type";
import {PostDbType} from "../04-posts/types/post-db-type";
import {UserDbType} from "../02-users/types/user-db-type";
import {CommentDbType} from "../05-comments/types/comment-db-type";
import {BlacklistedTokenModel} from "../01-auth/types/blacklisted-token-model";

let blogsCollection: Collection<BlogDbType>;

let postsCollection: Collection<PostDbType>;

let usersCollection: Collection<UserDbType>;

let commentsCollection: Collection<CommentDbType>;

let blackListCollection: Collection<BlacklistedTokenModel>;

const setBlogsCollection = (collection: Collection<BlogDbType>) => {
    blogsCollection = collection;
};

const setPostsCollection = (collection: Collection<PostDbType>) => {
    postsCollection = collection;
};

const setUsersCollection = (collection: Collection<UserDbType>) => {
    usersCollection = collection;
};

const setCommentsCollection = (collection: Collection<CommentDbType>) => {
    commentsCollection = collection;
};

async function runDb(url: string) {
    let client = new MongoClient(url);
    let db = client.db(SETTINGS.DB_NAME);

    blogsCollection = db.collection<BlogDbType>('blogs');
    postsCollection = db.collection<PostDbType>('posts');
    usersCollection = db.collection<UserDbType>('users');
    commentsCollection = db.collection<CommentDbType>('comments');
    blackListCollection = db.collection<BlacklistedTokenModel>('blackList');

    try {
        await client.connect();
        await db.command({ping: 1});

        console.log('connected to mongodb...');

        return true;
    } catch (error) {
        console.log(error);

        await client.close();

        return false;
    }
}

export {
    setBlogsCollection,
    setPostsCollection,
    setUsersCollection,
    setCommentsCollection,
    blogsCollection,
    postsCollection,
    usersCollection,
    commentsCollection,
    blackListCollection,
    runDb
};