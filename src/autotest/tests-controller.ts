import {Request, Response} from "express";
import {SETTINGS} from "../common/settings";

const testsController = {
    deleteAllData: async (
        req: Request,
        res: Response) => {
        try {

            res
                .status(SETTINGS.HTTP_STATUSES.NO_CONTENT_204)
                .json({});
        } catch (error) {
            console.error(error);
        }
    }
};

export {testsController};