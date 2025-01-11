type UserInputModel = {
    login: string,
    email: string
    password: string,
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