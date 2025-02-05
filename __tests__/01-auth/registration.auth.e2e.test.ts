import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {presets, user, userLogins} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId, WithId} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {ConfirmationStatus, UserDbType} from "../../src/02-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
import {nodemailerService} from "../../src/common/adapters/nodemailer-service";
import {EmailTemplateType} from "../../src/common/types/input-output-types/email-template-type";
import {usersRepository} from "../../src/02-users/repositoryes/users-repository";
import {emailTemplates} from "../../src/common/adapters/email-templates";
import {log} from "node:util";

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

    // it('should not log in if the user has sent invalid data (loginOrEmail: "undefined", password: "undefined").', async () => {
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     const resLogin: Response = await req
    //         .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
    //         .send({})
    //         .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(resLogin.body).toEqual(
    //         {
    //             errorsMessages: [
    //                 {
    //                     field: 'loginOrEmail',
    //                     message: 'The "loginOrEmail" field must be of the string type.'
    //                 },
    //                 {
    //                     field: 'password',
    //                     message: 'The "password" field must be of the string type.'
    //                 }
    //             ]
    //         }
    //     );
    //
    //     console_log_e2e(resLogin.body, resLogin.status, 'Test 2: post(/auth/login)');
    // });
    //
    // it('should not log in if the user has sent invalid data (loginOrEmail: type number, password: type number).', async () => {
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     const resLogin: Response = await req
    //         .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
    //         .send({
    //             loginOrEmail: 123,
    //             password: 123
    //         })
    //         .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(resLogin.body).toEqual({
    //         errorsMessages: [
    //             {
    //                 field: 'loginOrEmail',
    //                 message: 'The "loginOrEmail" field must be of the string type.'
    //             },
    //             {
    //                 field: 'password',
    //                 message: 'The "password" field must be of the string type.'
    //             }
    //         ]
    //     });
    //
    //     console_log_e2e(resLogin.body, resLogin.status, 'Test 3: post(/auth/login)');
    // });
    //
    // it('should not log in if the user has sent invalid data (loginOrEmail: empty line, password: empty line).', async () => {
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     const resLogin: Response = await req
    //         .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
    //         .send({
    //             loginOrEmail: '   ',
    //             password: '   '
    //         })
    //         .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(resLogin.body).toEqual({
    //         errorsMessages: [
    //             {
    //                 field: 'loginOrEmail',
    //                 message: 'The length of the "loginOrEmail" field should be from 3 to 100.'
    //             },
    //             {
    //                 field: 'password',
    //                 message: 'The length of the "password" field should be from 6 to 20.'
    //             }
    //         ]
    //     });
    //
    //     console_log_e2e(resLogin.body, resLogin.status, 'Test 4: post(/auth/login)');
    // });
    //
    // it('should not log in if the user has sent invalid data (loginOrEmail: exceeds max length, password: exceeds max length).', async () => {
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     const resLogin: Response = await req
    //         .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
    //         .send({
    //             loginOrEmail: generateRandomString(101),
    //             password: generateRandomString(21)
    //         })
    //         .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(resLogin.body).toEqual({
    //         errorsMessages: [
    //             {
    //                 field: 'loginOrEmail',
    //                 message: 'The length of the "loginOrEmail" field should be from 3 to 100.'
    //             },
    //             {
    //                 field: 'password',
    //                 message: 'The length of the "password" field should be from 6 to 20.'
    //             }
    //         ]
    //     });
    //
    //     console_log_e2e(resLogin.body, resLogin.status, 'Test 5: post(/auth/login)');
    // });
    //
    // it('should not be authorized if the user has sent incorrect data (loginOrEmail: non-existent login).', async () => {
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     const resAuth: Response = await req
    //         .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
    //         .send({
    //             loginOrEmail: generateRandomString(10),
    //             password: presets.users[0].login
    //         })
    //         .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
    //
    //     expect(resAuth.body).toEqual({
    //         errorsMessages: [
    //             {
    //                 field: 'loginOrEmailOrPassword',
    //                 message: 'Login, email or password incorrect.'
    //             }
    //         ]
    //     });
    //
    //     console_log_e2e(resAuth.body, resAuth.status, 'Test 6: post(/auth/login)');
    // });
    //
    // it('should not be authorized if the user has sent incorrect data (password: invalid password).', async () => {
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     const resAuth: Response = await req
    //         .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
    //         .send({
    //             loginOrEmail: presets.users[0].login,
    //             password: 'qwertyu'
    //         })
    //         .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
    //
    //     expect(resAuth.body).toEqual({
    //         errorsMessages: [
    //             {
    //                 field: 'loginOrEmailOrPassword',
    //                 message: 'Login, email or password incorrect.'
    //             }
    //         ]
    //     });
    //
    //     console_log_e2e(resAuth.body, resAuth.status, 'Test 7: post(/auth/login)');
    // });
});
