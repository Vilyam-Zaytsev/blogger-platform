import {Request, Response} from "express";
import {db} from "../db/db";
import {SETTINGS} from "../settings";

const testsController = {
    deleteAllData: (
        req: Request,
        res: Response) => {
            db.blogs = [];
            db.posts = [];

            res
                .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
                .json({'message': 'All data has been deleted.'});
        }
};

export {testsController};