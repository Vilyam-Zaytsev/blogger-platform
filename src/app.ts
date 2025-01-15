import express, {Response, Request} from 'express';
import {SETTINGS} from "./common/settings";
import {blogsRouter} from "./03-blogs/blogs-router";
import {postsRouter} from "./04-posts/posts-router";
import {testsRouter} from "./autotest/tests-router";
import {authRouter} from "./01-auth/auth-router";
import {usersRouter} from "./02-users/users-router";
import {commentsRouter} from "./05-comments/comments-router";


const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res
        .status(200)
        .json({version: '1.0'});
});

app.use(SETTINGS.PATH.AUTH.BASE, authRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);
app.use(SETTINGS.PATH.TESTS, testsRouter);

export {app};
