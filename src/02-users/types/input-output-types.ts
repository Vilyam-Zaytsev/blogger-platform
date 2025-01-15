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
type UserMeViewModel = {
    email: string,
    login: string,
    userId: string
};

export {
    UserInputModel,
    UserViewModel,
    UserMeViewModel,
};