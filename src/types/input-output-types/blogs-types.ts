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
    isMembership: boolean
};

type URIParamsBlogId = {
    id: string
};

export {
    BlogInputModel,
    BlogViewModel,
    URIParamsBlogId
};