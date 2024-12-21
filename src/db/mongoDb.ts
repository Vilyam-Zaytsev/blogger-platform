import {Collection, MongoClient} from "mongodb";
import {SETTINGS} from "../settings";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {PostDbType} from "../types/db-types/post-db-type";

let blogsCollection: Collection<BlogDbType>;
let postsCollection: Collection<PostDbType>;

const setBlogsCollection = (collection: Collection<BlogDbType>) => {
    blogsCollection = collection;
};

const setPostsCollection = (collection: Collection<PostDbType>) => {
    postsCollection = collection;
};

async function runDb(url: string) {
    let client = new MongoClient(url);
    let db = client.db(SETTINGS.DB_NAME);

    blogsCollection = db.collection<BlogDbType>('blogs');
    postsCollection = db.collection<PostDbType>('posts');
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
    blogsCollection,
    postsCollection,
    runDb
};