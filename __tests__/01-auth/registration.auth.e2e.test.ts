import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, user, userLogins} from "../helpers/datasets-for-tests";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {UsersRepository} from "../../src/03-users/repositoryes/users-repository";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {UserViewModel} from "../../src/03-users/types/input-output-types";
import {ConfirmationStatus, UserDocument} from "../../src/03-users/domain/user-entity";
import mongoose from "mongoose";
import {NodemailerService} from "../../src/01-auth/adapters/nodemailer-service";
import {container} from "../../src/composition-root";

const usersRepository: UsersRepository = container.get(UsersRepository);

let sendEmailMock: any;

beforeAll(async () => {

    const uri = SETTINGS.MONGO_URL;

    if (!uri) {

        throw new Error("MONGO_URL is not defined in SETTINGS");
    }

    await runDb(uri);

    //@ts-ignore
    sendEmailMock = jest
        .spyOn(NodemailerService.prototype, 'sendEmail')
        .mockResolvedValue(true);
});

afterAll(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();

    jest.clearAllMocks();
    clearPresets();
});

beforeEach(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();

    jest.clearAllMocks();
    clearPresets();
});

describe('POST /auth/registration', () => {

    it('should be registered if the user has sent the correct data (login or email address and password).', async () => {

        const resRegistration: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
            .send({
                login: user.login,
                email: user.email,
                password: user.password
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundUser: UserDocument | null = await usersRepository
            .findByEmail(user.email);

        const foundUser_obj = foundUser
            ? { ...foundUser.toObject(), _id: foundUser._id.toString() }
            : null;

        expect(foundUser_obj).toEqual({
            _id: expect.any(String),
            login: user.login,
            email: user.email,
            passwordHash: expect.any(String),
            createdAt: expect.any(String),
            passwordRecovery: null,
            emailConfirmation: {
                confirmationCode: expect.any(String),
                expirationDate: expect.anything(),
                confirmationStatus: ConfirmationStatus.NotConfirmed
            },
            __v: 0
        });

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(1);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 1: post(/auth/registration)');
    });

    it('should not register if the user has sent more than 5 requests from one IP to "/login" in the last 10 seconds.', async () => {

        for (let i = 0; i < 5; i++) {

            await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
                .send({
                    login: userLogins[i],
                    email: `${userLogins[i]}@example.com`,
                    password: userLogins[i]
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
        }

        const resRegistration: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
            .send({
                login: user.login,
                email: user.email,
                password: user.password
            })
            .expect(SETTINGS.HTTP_STATUSES.TOO_MANY_REQUESTS_429);

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(5);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 2: post(/auth/registration)');
    });

    it('should not be registered if a user with such data already exists (login).', async () => {

        await usersTestManager
            .createUser(1);

        const resRegistration: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
            .send({
                login: user.login,
                email: `${userLogins[1]}@example.com`,
                password: userLogins[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(1);

        expect(sendEmailMock).toHaveBeenCalledTimes(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 3: post(/auth/registration)');
    });

    it('should not be registered if a user with such data already exists (email).', async () => {

        await usersTestManager
            .createUser(1);

        const resRegistration: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
            .send({
                login: userLogins[1],
                email: user.email,
                password: userLogins[1]
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(1);

        expect(sendEmailMock).toHaveBeenCalledTimes(0);


        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 4: post(/auth/registration)');
    });

    it('should not be registered a user if the data in the request body is incorrect (an empty object is passed).', async () => {

        const resRegistration: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
            .send({})
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistration.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'login',
                        message: 'The "login" field must be of the string type.'
                    },
                    {
                        field: 'email',
                        message: 'The "email" field must be of the string type.'
                    },
                    {
                        field: 'password',
                        message: 'The "password" field must be of the string type.'
                    },
                ]
            },
        );

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        expect(sendEmailMock).toHaveBeenCalledTimes(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 5: post(/auth/registration)');
    });

    it('should not be registered a user if the data in the request body is incorrect (login: empty line, email: empty line, password: empty line).', async () => {

        const resRegistration: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
            .send({
                login: '   ',
                email: '   ',
                password: '   ',
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistration.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'login',
                        message: 'The length of the "login" field should be from 3 to 10.'
                    },
                    {
                        field: 'email',
                        message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
                    },
                    {
                        field: 'password',
                        message: 'The length of the "password" field should be from 6 to 20.'
                    },
                ]
            },
        );

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        expect(sendEmailMock).toHaveBeenCalledTimes(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 6: post(/auth/registration)');
    });

    it('should not be registered a user if the data in the request body is incorrect (login: less than the minimum length, email: incorrect, password: less than the minimum length).', async () => {

        const resRegistration: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
            .send({
                login: generateRandomString(2),
                email: generateRandomString(10),
                password: generateRandomString(5),
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistration.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'login',
                        message: 'The length of the "login" field should be from 3 to 10.'
                    },
                    {
                        field: 'email',
                        message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
                    },
                    {
                        field: 'password',
                        message: 'The length of the "password" field should be from 6 to 20.'
                    },
                ]
            },
        );

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        expect(sendEmailMock).toHaveBeenCalledTimes(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 7: post(/auth/registration)');
    });

    it('should not be registered a user if the data in the request body is incorrect (login: exceeds max length,  email: incorrect, password: exceeds max length).', async () => {

        const resRegistration: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
            .send({
                login: generateRandomString(11),
                email: generateRandomString(10),
                password: generateRandomString(21),
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistration.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'login',
                        message: 'The length of the "login" field should be from 3 to 10.'
                    },
                    {
                        field: 'email',
                        message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
                    },
                    {
                        field: 'password',
                        message: 'The length of the "password" field should be from 6 to 20.'
                    },
                ]
            },
        );

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        expect(sendEmailMock).toHaveBeenCalledTimes(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 8: post(/auth/registration)');
    });

    it('should not be registered a user if the data in the request body is incorrect (login: type number,  email: type number, password: type number).', async () => {

        const resRegistration: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION}`)
            .send({
                login: 123,
                email: 123,
                password: 123,
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistration.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'login',
                        message: 'The "login" field must be of the string type.'
                    },
                    {
                        field: 'email',
                        message: 'The "email" field must be of the string type.'
                    },
                    {
                        field: 'password',
                        message: 'The "password" field must be of the string type.'
                    },
                ]
            },
        );

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        expect(sendEmailMock).toHaveBeenCalledTimes(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 9: post(/auth/registration)');
    });
});
