type BlogInputModel = {
    name: string,
    description: string,
    websiteUrl: string
};

type BlogViewModel = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
    isMembership: boolean //True if user has not expired membership subscription to blog
};

export {
    BlogInputModel,
    BlogViewModel
};