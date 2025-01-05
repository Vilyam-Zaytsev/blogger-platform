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
}

export {
    UserInputModel,
    UserViewModel
};