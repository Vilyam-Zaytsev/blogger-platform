import {Router} from "express";
import {testsController} from "../controllers/testsController";

const testsRouter = Router();

testsRouter.delete('/', testsController.deleteAllData);

export {testsRouter};