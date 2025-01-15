import {Collection, MongoClient} from "mongodb";
import {SETTINGS} from "../common/settings";
import {BlogDbType} from "../03-blogs/types/blog-db-type";
import {PostDbType} from "../04-posts/types/post-db-type";
import {UserDbType} from "../02-users/types/user-db-type";

let blogsCollection: Collection<BlogDbType>;
let postsCollection: Collection<PostDbType>;

let usersCollection: Collection<UserDbType>;

const setBlogsCollection = (collection: Collection<BlogDbType>) => {
    blogsCollection = collection;
};

const setPostsCollection = (collection: Collection<PostDbType>) => {
    postsCollection = collection;
};

const setUserCollection = (collection: Collection<UserDbType>) => {
    usersCollection = collection;
};

async function runDb(url: string) {
    let client = new MongoClient(url);
    let db = client.db(SETTINGS.DB_NAME);

    blogsCollection = db.collection<BlogDbType>('blogs');
    postsCollection = db.collection<PostDbType>('posts');
    usersCollection = db.collection<UserDbType>('users');
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
    setUserCollection,
    blogsCollection,
    postsCollection,
    usersCollection,
    runDb
};