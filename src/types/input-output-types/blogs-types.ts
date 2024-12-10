type BlogInputModel = {
    name: string,
    description: string,
    websiteUrl: string
};

type BlogViewModel = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string
};

type URIParamsBlogIdModel = {
    id: string
};

export {
    BlogInputModel,
    BlogViewModel,
    URIParamsBlogIdModel
};