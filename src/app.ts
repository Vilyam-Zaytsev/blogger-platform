import express, {Response, Request} from 'express';
import {SETTINGS} from "./settings";
import {blogsRouter} from "./routes/blogsRouter";
import {postsRouter} from "./routes/postsRouter";
import {testsRouter} from "./routes/testsRouter";


const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res
        .status(200)
        .json({version: '1.0'});
});

app.use(SETTINGS.PATH.BLOGS, blogsRouter);
app.use(SETTINGS.PATH.POSTS, postsRouter);
app.use(SETTINGS.PATH.TESTS, testsRouter);

export {app};
