import {Router} from "express";
import {testsController} from "./testsController";

const testsRouter = Router();

testsRouter.delete('/', testsController.deleteAllData);

export {testsRouter};