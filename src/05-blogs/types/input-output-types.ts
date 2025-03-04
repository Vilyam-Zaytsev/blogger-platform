type BlogInputModel = {
    name: string,
    description: string,
    websiteUrl: string
};

type BlogPostInputModel = {
    title: string,
    shortDescription: string,
    content: string
};

type BlogViewModel = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
    isMembership: boolean
};

export {
    BlogInputModel,
    BlogPostInputModel,
    BlogViewModel
};