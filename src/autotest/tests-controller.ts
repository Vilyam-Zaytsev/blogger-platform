import {Request, Response} from "express";
import {SETTINGS} from "../common/settings";
import {postsCollection} from "../db/mongo-db/mongoDb";

const testsController = {
    deleteAllData: async (
        req: Request,
        res: Response) => {
        try {
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