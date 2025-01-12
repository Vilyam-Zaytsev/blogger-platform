import express, {Response, Request} from 'express';
import {SETTINGS} from "./common/settings";
import {blogsRouter} from "./blogs/blogsRouter";
import {postsRouter} from "./posts/postsRouter";
import {testsRouter} from "./autotest/testsRouter";
import {authRouter} from "./auth/authRouter";
import {usersRouter} from "./users/usersRouter";


const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res
        .status(200)
        .json({version: '1.0'});
});

app.use(SETTINGS.PATH.AUTH, authRouter);
app.use(SETTINGS.PATH.USERS, usersRouter);
app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.TESTS, testsRouter);

export {app};
