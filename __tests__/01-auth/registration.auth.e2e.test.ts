import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {presets, user, userLogins} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId, WithId} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {ConfirmationStatus, UserDbType} from "../../src/04-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {nodemailerService} from "../../src/01-auth/adapters/nodemailer-service";
import {EmailTemplateType} from "../../src/common/types/input-output-types/email-template-type";
import {usersRepository} from "../../src/04-users/repositoryes/users-repository";
import {emailTemplates} from "../../src/01-auth/adapters/email-templates";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {UserViewModel} from "../../src/04-users/types/input-output-types";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setUsersCollection(db.collection<UserDbType>('users'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});
    presets.users = [];

    nodemailerService.sendEmail = jest
        .fn()
        .mockImplementation((email: string, template: EmailTemplateType) => {
            return Promise.resolve({
                email,
                template
            });
        })
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

        const foundUser: WithId<UserDbType> | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser).toEqual({
            _id: expect.any(ObjectId),
            login: user.login,
            email: user.email,
            passwordHash: expect.any(String),
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            emailConfirmation: {
                confirmationCode: expect.any(String),
                expirationDate: expect.any(Date),
                confirmationStatus: ConfirmationStatus.NotConfirmed
            }
        });

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(1);
        expect(await (nodemailerService.sendEmail as jest.Mock).mock.results[0].value)
            .toEqual({
                email: foundUser!.email,
                template: emailTemplates.registrationEmail(foundUser!.emailConfirmation.confirmationCode!)
            });

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 1: post(/auth/registration)');
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

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(0);

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(1);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 2: post(/auth/registration)');
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

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(0);

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(1);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 3: post(/auth/registration)');
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

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(0);

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 4: post(/auth/registration)');
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

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(0);

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 5: post(/auth/registration)');
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

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(0);

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 6: post(/auth/registration)');
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

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(0);

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 7: post(/auth/registration)');
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

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(0);

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resRegistration.body, resRegistration.status, 'Test 8: post(/auth/registration)');
    });
});
