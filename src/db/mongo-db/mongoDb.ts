import {Collection, MongoClient} from "mongodb";
import {SETTINGS} from "../../common/settings";
import {BlogDbType} from "../../05-blogs/types/blog-db-type";
import {PostDbType} from "../../06-posts/types/post-db-type";
import {CommentDbType} from "../../07-comments/types/comment-db-type";
import {User} from "../../04-users/domain/user.entity";
import mongoose from "mongoose";

let blogsCollection: Collection<BlogDbType>;

let postsCollection: Collection<PostDbType>;

let usersCollection: Collection<User>;

let commentsCollection: Collection<CommentDbType>;

// let sessionsCollection: Collection<Session>;

// let apiTrafficCollection: Collection<ApiTrafficType>;

const setBlogsCollection = (collection: Collection<BlogDbType>) => {
    blogsCollection = collection;
};

const setPostsCollection = (collection: Collection<PostDbType>) => {
    postsCollection = collection;
};

const setUsersCollection = (collection: Collection<User>) => {
    usersCollection = collection;
};

const setCommentsCollection = (collection: Collection<CommentDbType>) => {
    commentsCollection = collection;
};

// const setSessionsCollection = (collection: Collection<Session>) => {
//     sessionsCollection = collection;
// };

// const setApiTrafficCollection = (collection: Collection<ApiTrafficType>) => {
//     apiTrafficCollection = collection;
// };

async function runDb(url: string) {
    let client = new MongoClient(url);
    let db = client.db(SETTINGS.DB_NAME);

    blogsCollection = db.collection<BlogDbType>('blogs');
    postsCollection = db.collection<PostDbType>('posts');
    usersCollection = db.collection<User>('users');
    commentsCollection = db.collection<CommentDbType>('comments');
    // sessionsCollection = db.collection<Session>('sessions');
    // apiTrafficCollection = db.collection<ApiTrafficType>('ApiTraffic');

    try {
        await client.connect();
        await mongoose.connect(`${SETTINGS.MONGO_URL}/${SETTINGS.DB_NAME}`);
        await db.command({ping: 1});

        console.log('connected to mongodb...');

        return true;
    } catch (error) {
        console.log(error);

        await client.close();
        await mongoose.disconnect();

        return false;
    }
}

export {
    setBlogsCollection,
    setPostsCollection,
    setUsersCollection,
    setCommentsCollection,
    // setSessionsCollection,
    // setApiTrafficCollection,
    blogsCollection,
    postsCollection,
    usersCollection,
    commentsCollection,
    // sessionsCollection,
    // apiTrafficCollection,
    runDb
};