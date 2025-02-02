import {console_log, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {presets} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/02-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";

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
});

describe('POST /auth/login', () => {

    it('should be authorized if the user has sent the correct data (loginOrEmail and password).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: presets.users[0].login,
                password: presets.users[0].login
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resLogin.body).toEqual<LoginSuccessViewModel>(
            expect.objectContaining({
                accessToken: expect.any(String)
            })
        );

        console_log(resLogin.body, resLogin.status, 'Test 1: post(/auth/login)');
    });

    it('should not log in if the user has sent invalid data (loginOrEmail: "undefined", password: "undefined").', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({})
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resLogin.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'loginOrEmail',
                        message: 'The "loginOrEmail" field must be of the string type.'
                    },
                    {
                        field: 'password',
                        message: 'The "password" field must be of the string type.'
                    }
                ]
            }
        );

        console_log(resLogin.body, resLogin.status, 'Test 2: post(/auth/login)');
    });

    it('should not log in if the user has sent invalid data (loginOrEmail: type number, password: type number).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: 123,
                password: 123
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resLogin.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmail',
                    message: 'The "loginOrEmail" field must be of the string type.'
                },
                {
                    field: 'password',
                    message: 'The "password" field must be of the string type.'
                }
            ]
        });

        console_log(resLogin.body, resLogin.status, 'Test 3: post(/auth/login)');
    });

    it('should not log in if the user has sent invalid data (loginOrEmail: empty line, password: empty line).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: '   ',
                password: '   '
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resLogin.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmail',
                    message: 'The length of the "loginOrEmail" field should be from 3 to 100.'
                },
                {
                    field: 'password',
                    message: 'The length of the "password" field should be from 6 to 20.'
                }
            ]
        });

        console_log(resLogin.body, resLogin.status, 'Test 4: post(/auth/login)');
    });

    it('should not log in if the user has sent invalid data (loginOrEmail: exceeds max length, password: exceeds max length).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: generateRandomString(101),
                password: generateRandomString(21)
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resLogin.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmail',
                    message: 'The length of the "loginOrEmail" field should be from 3 to 100.'
                },
                {
                    field: 'password',
                    message: 'The length of the "password" field should be from 6 to 20.'
                }
            ]
        });

        console_log(resLogin.body, resLogin.status, 'Test 5: post(/auth/login)');
    });

    it('should not be authorized if the user has sent incorrect data (loginOrEmail: non-existent login).', async () => {

        await usersTestManager
            .createUser(1);

        const resAuth: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: generateRandomString(10),
                password: presets.users[0].login
            })
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        expect(resAuth.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmailOrPassword',
                    message: 'Login, email or password incorrect.'
                }
            ]
        });

        console_log(resAuth.body, resAuth.status, 'Test 6: post(/auth/login)');
    });

    it('should not be authorized if the user has sent incorrect data (password: invalid password).', async () => {

        await usersTestManager
            .createUser(1);

        const resAuth: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: presets.users[0].login,
                password: 'qwertyu'
            })
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        expect(resAuth.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmailOrPassword',
                    message: 'Login, email or password incorrect.'
                }
            ]
        });

        console_log(resAuth.body, resAuth.status, 'Test 7: post(/auth/login)');
    });
});
