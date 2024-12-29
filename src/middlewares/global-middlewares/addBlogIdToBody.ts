const addBlogIdToBody = (req, res, next) => {
    req.body.blogId = req.params.id;

    next();
};

export {addBlogIdToBody};