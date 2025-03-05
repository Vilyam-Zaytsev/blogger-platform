import {Collection, MongoClient} from "mongodb";
import {SETTINGS} from "../common/settings";
import {BlogDbType} from "../05-blogs/types/blog-db-type";
import {PostDbType} from "../06-posts/types/post-db-type";
import {UserDbType} from "../04-users/types/user-db-type";
import {CommentDbType} from "../07-comments/types/comment-db-type";
import {ActiveSessionType} from "../02-sessions/types/active-session-type";
import {ApiTrafficType} from "../common/types/api-traffic-type";

let blogsCollection: Collection<BlogDbType>;

let postsCollection: Collection<PostDbType>;

let usersCollection: Collection<UserDbType>;

let commentsCollection: Collection<CommentDbType>;

let sessionsCollection: Collection<ActiveSessionType>;

let apiTrafficCollection: Collection<ApiTrafficType>;

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

const setSessionsCollection = (collection: Collection<ActiveSessionType>) => {
    sessionsCollection = collection;
};

const setApiTrafficCollection = (collection: Collection<ApiTrafficType>) => {
    apiTrafficCollection = collection;
};

async function runDb(url: string) {
    let client = new MongoClient(url);
    let db = client.db(SETTINGS.DB_NAME);

    blogsCollection = db.collection<BlogDbType>('blogs');
    postsCollection = db.collection<PostDbType>('posts');
    usersCollection = db.collection<UserDbType>('users');
    commentsCollection = db.collection<CommentDbType>('comments');
    sessionsCollection = db.collection<ActiveSessionType>('sessions');
    apiTrafficCollection = db.collection<ApiTrafficType>('ApiTraffic');

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
    setSessionsCollection,
    setApiTrafficCollection,
    blogsCollection,
    postsCollection,
    usersCollection,
    commentsCollection,
    sessionsCollection,
    apiTrafficCollection,
    runDb
};