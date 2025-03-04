import express, {Response, Request} from 'express';
import {SETTINGS} from "./common/settings";
import {blogsRouter} from "./05-blogs/api/blogs-router";
import {postsRouter} from "./06-posts/api/posts-router";
import {testsRouter} from "./autotest/tests-router";
import {authRouter} from "./01-auth/api/auth-router";
import {usersRouter} from "./04-users/api/users-router";
import {commentsRouter} from "./07-comments/api/comments-router";
import cookieParser from "cookie-parser";
import {sessionsRouter} from "./02-sessions/api/sessions-router";


const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
    res
        .status(200)
        .json({version: '1.0'});
});

app.use(SETTINGS.PATH.AUTH.BASE, authRouter);
app.use(SETTINGS.PATH.SECURITY_DEVICES.BASE, sessionsRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.COMMENTS, commentsRouter);
app.use(SETTINGS.PATH.TESTS, testsRouter);

export {app};
