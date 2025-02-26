import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {presets} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {sessionsCollection, setSessionsCollection, setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/04-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

    // const user = db.collection('user')
    //TODO: replace with runDB func

    setUsersCollection(db.collection<UserDbType>('users'));
    setSessionsCollection(db.collection<ActiveSessionType>('sessions'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});
    await sessionsCollection.deleteMany({});

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
            {
                accessToken: expect.any(String)
            }
        );

        expect(resLogin.headers['set-cookie']).toBeDefined();
        expect(resLogin.headers['set-cookie'][0]).toMatch(/refreshToken=.*;/);

        console_log_e2e(resLogin.body, resLogin.status, 'Test 1: post(/auth/login)');
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

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 2: post(/auth/login)');
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

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 3: post(/auth/login)');
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

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 4: post(/auth/login)');
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

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 5: post(/auth/login)');
    });

    it('should not be authorized if the user has sent incorrect data (loginOrEmail: non-existent login).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: generateRandomString(10),
                password: presets.users[0].login
            })
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        expect(resLogin.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmailOrPassword',
                    message: 'Login, email or password incorrect.'
                }
            ]
        });

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 6: post(/auth/login)');
    });

    it('should not be authorized if the user has sent incorrect data (password: invalid password).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: presets.users[0].login,
                password: 'qwertyu'
            })
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        expect(resLogin.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmailOrPassword',
                    message: 'Login, email or password incorrect.'
                }
            ]
        });

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 7: post(/auth/login)');
    });
});
