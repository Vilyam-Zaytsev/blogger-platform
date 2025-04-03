import {Request, Response} from "express";
import {SETTINGS} from "../common/settings";
import mongoose from "mongoose";

const testsController = {
    deleteAllData: async (
        req: Request,
        res: Response) => {

        try {

            if (!mongoose.connection.db) {

                throw new Error("mongoose.connection.db is undefined");
            }

            await mongoose.connection.db.dropDatabase();

            res
                .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
                .json({});
        } catch (error) {
            console.error(error);
        }
    }
};

export {testsController};