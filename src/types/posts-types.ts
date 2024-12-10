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

export {
    PostInputModel,
    PostViewModel
};