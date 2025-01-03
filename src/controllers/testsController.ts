import {Request, Response} from "express";
import {SETTINGS} from "../settings";
import {blogsCollection, postsCollection} from "../db/mongoDb";

const testsController = {
    deleteAllData: async (
        req: Request,
        res: Response) => {
        try {
            const resultBlogsDeletion = await blogsCollection.deleteMany();
            const resultPostsDeletion = await postsCollection.deleteMany();

            res
                .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
                .json({});
        } catch (error) {
            console.error(error);
        }
    }
};

export {testsController};