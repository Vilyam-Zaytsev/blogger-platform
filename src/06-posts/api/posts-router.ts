import {Router} from "express";
import {PostsController} from '../posts-controller';
import {baseAuthGuard} from "../../01-auth/api/guards/base-auth-guard";
import {
    postBlogIdInputValidator,
    postContentInputValidator,
    postShortDescriptionInputValidator,
    postTitleInputValidator
} from "./middlewares/post-validators";
import {inputCheckErrorsMiddleware} from "../../common/middlewares/input-check-errors-middleware";
import {
    pageNumberInputValidator,
    pageSizeInputValidator, sortByInputValidator, sortDirectionInputValidator
} from "../../common/middlewares/query-parameters-validator";
import {SETTINGS} from "../../common/settings";
import {CommentsController} from "../../07-comments/comments-controller";
import {accessTokenGuard} from "../../01-auth/api/guards/access-token-guard";
import {commentContentInputValidator} from "../../07-comments/api/middlewares/comment-validators";
import {container} from "../../composition-root";

const postsRouter = Router();
const postsController: PostsController = container.get(PostsController);
const commentsController: CommentsController = container.get(CommentsController);

postsRouter.get('/',
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    inputCheckErrorsMiddleware,
    postsController.getPosts.bind(postsController)
);
postsRouter.get('/:id',
    postsController.getPost.bind(postsController)
);
postsRouter.get(`/:id${SETTINGS.PATH.COMMENTS}`,
    pageNumberInputValidator,
    pageSizeInputValidator,
    sortByInputValidator,
    sortDirectionInputValidator,
    inputCheckErrorsMiddleware,
    commentsController.getComments.bind(commentsController)
);
postsRouter.post('/',
    baseAuthGuard,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.createPost.bind(postsController)
);
postsRouter.post(`/:id${SETTINGS.PATH.COMMENTS}`,
    accessTokenGuard,
    commentContentInputValidator,
    inputCheckErrorsMiddleware,
    commentsController.createComment.bind(commentsController)
);
postsRouter.put('/:id',
    baseAuthGuard,
    postTitleInputValidator,
    postShortDescriptionInputValidator,
    postContentInputValidator,
    postBlogIdInputValidator,
    inputCheckErrorsMiddleware,
    postsController.updatePost.bind(postsController)
);
postsRouter.delete('/:id',
    baseAuthGuard,
    postsController.deletePost.bind(postsController)
);

export {postsRouter};