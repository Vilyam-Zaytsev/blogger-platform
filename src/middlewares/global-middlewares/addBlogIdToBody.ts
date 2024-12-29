import {RequestHandler} from "express";

const addBlogIdToBody: RequestHandler<{ id: string }>  = (req, res, next) => {
    req.body.blogId = req.params.id;

    console.log(req.body)
    console.log(req.params.id)

    next();
};

export {addBlogIdToBody};