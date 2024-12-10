type PostInputModel = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
};

type PostViewModel = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
};

type URIParamsPostIdModel = {
    id: string
};

export {
    PostInputModel,
    PostViewModel,
    URIParamsPostIdModel
};