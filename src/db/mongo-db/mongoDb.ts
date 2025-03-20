import {Collection, MongoClient} from "mongodb";
import {SETTINGS} from "../../common/settings";
import {PostDbType} from "../../06-posts/types/post-db-type";
import {CommentDbType} from "../../07-comments/types/comment-db-type";
import mongoose from "mongoose";

let postsCollection: Collection<PostDbType>;

let commentsCollection: Collection<CommentDbType>;

const setPostsCollection = (collection: Collection<PostDbType>) => {
    postsCollection = collection;
};

const setCommentsCollection = (collection: Collection<CommentDbType>) => {
    commentsCollection = collection;
};

async function runDb(url: string) {
    let client = new MongoClient(url);
    let db = client.db(SETTINGS.DB_NAME);

    postsCollection = db.collection<PostDbType>('posts');
    commentsCollection = db.collection<CommentDbType>('comments');

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
    setPostsCollection,
    setCommentsCollection,
    postsCollection,
    commentsCollection,
    runDb
};