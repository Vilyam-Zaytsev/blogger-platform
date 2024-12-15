import {Router} from "express";
import {postsController} from '../controllers/postsController';
import {authMiddleware} from "../middlewares/global-middlewares/authorization-middleware";

const postsRouter = Router();

postsRouter.get('/', postsController.getPosts);
postsRouter.get('/:id', postsController.getPost);
postsRouter.post('/',
    authMiddleware,
    postsController.createPost
);
postsRouter.put('/:id', postsController.updatePost);
postsRouter.delete('/:id', postsController.deletePost);

export {postsRouter};