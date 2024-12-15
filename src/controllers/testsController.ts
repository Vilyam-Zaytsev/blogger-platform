import {Request, Response} from "express";
import {db} from "../db/db";

const testsController = {
    deleteAllData: (
        req: Request,
        res: Response) => {
            db.blogs = [];
            db.posts = [];

            res
                .status(204)
                .json({'message': 'All data has been deleted.'});
        }
};

export {testsController};