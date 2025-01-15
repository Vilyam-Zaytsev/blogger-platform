import {Router} from "express";
import {commentsController} from "./comments-controller";

const commentsRouter = Router();

commentsRouter.get('/:id', commentsController.getComment);
commentsRouter.put('/:id', commentsController.updateComment);
commentsRouter.delete('/:id', commentsController.deleteComment);

export {commentsRouter};
