import express, {Response, Request} from 'express';


const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res
        .status(200)
        .json({version: '1.0'});
});

export {app};
