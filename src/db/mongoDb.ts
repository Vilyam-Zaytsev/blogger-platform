import {Collection, MongoClient} from "mongodb";
import {SETTINGS} from "../settings";
import {BlogDbType} from "../types/db-types/blog-db-type";
import {PostDbType} from "../types/db-types/post-db-type";

let blogsCollection: Collection<BlogDbType>;
let postsCollection: Collection<PostDbType>;

async function runDb(url: string) {
    console.log(1)

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
    blogsCollection,
    postsCollection,
    runDb
};