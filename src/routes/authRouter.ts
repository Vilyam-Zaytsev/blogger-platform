import {Router} from "express";

const authRouter = Router();

authRouter.delete('/', testsController.deleteAllData);

export {authRouter};