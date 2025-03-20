import {Request, Response} from "express";
import {SETTINGS} from "../common/settings";
import {blogsCollection, postsCollection} from "../db/mongo-db/mongoDb";

const testsController = {
    deleteAllData: async (
        req: Request,
        res: Response) => {
        try {
            const resultBlogsDeletion = await blogsCollection.deleteMany();
            const resultPostsDeletion = await postsCollection.deleteMany();
            // const resultUsersDeletion = await usersCollection.deleteMany();

            res
                .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
                .json({});
        } catch (error) {
            console.error(error);
        }
    }
};

export {testsController};