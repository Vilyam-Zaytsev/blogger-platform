type UserInputModel = {
    login: string,
    password: string,
    email: string
};

type UserViewModel = {
    id: string,
    login: string,
    email: string,
    createdAt: string
};

type URIParamsUserId = {
    id: string
};

export {
    UserInputModel,
    UserViewModel,
    URIParamsUserId
};